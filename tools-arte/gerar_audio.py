#!/usr/bin/env python3
"""
Áudio do Marco 6 (GDD 19.2; ADR-008): trilha de fundo e os efeitos S01 a S13, por síntese original do projeto.

Saídas (sempre sobrescritas por este script; nenhum arquivo de áudio é editado à mão):
  assets/audio/mus_natal.mp3 e assets/audio/sfx_sNN_*.mp3   MP3 mono, 22.050 Hz, CBR 32 kbps
  assets/audio/audio-meta.json                              medidas de cada arquivo, lidas do MP3 decodificado
  content/audio.json                                        ids e ganhos (ADR-008 seção 8.1); os ganhos já existentes são preservados
  docs/audio-licencas.md                                    origem e data de cada arquivo (GDD 19.2.5)

Modos:
  (padrão)      versão final
  --rascunho    versão curta para o Dev integrar: tons simples, mesmos nomes e durações; meta com "rascunho": true
  --verificar   sintetiza em memória e confere o SHA-256 do PCM com o meta; não escreve nada

Uso (o Python do Homebrew não tem numpy; use o do sistema):
  /usr/bin/python3 tools-arte/gerar_audio.py [--rascunho | --verificar]

Requer: numpy e ffmpeg com libmp3lame. Sem scipy: o filtro é feito em numpy.
KB = 1000 bytes (GDD 19.2.6).
"""
from __future__ import annotations

import datetime
import hashlib
import json
import math
import shutil
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

import numpy as np

RAIZ = Path(__file__).resolve().parent.parent
PASTA_AUDIO = RAIZ / "assets" / "audio"
ARQ_META = PASTA_AUDIO / "audio-meta.json"
ARQ_CONTEUDO = RAIZ / "content" / "audio.json"
ARQ_LICENCAS = RAIZ / "docs" / "audio-licencas.md"

SR = 22050
KBPS = 32
SEMENTE = 1225
MESTRE_PADRAO = 0.45
MUS_GANHO_PADRAO = -15.0
PICO_ALVO_DBFS = -3.2  # PCM; o MP3 decodificado precisa ficar em -3,0 dBFS ou menos (AU10)
PICO_ALVO = 10 ** (PICO_ALVO_DBFS / 20.0)
ORIGEM = "gerado pelo projeto, síntese original"
MUS_ID = "mus_natal"
MUS_SEG = 36.0
BPM = 80  # 4/4 a 80 BPM: 1 compasso = 3 s; 12 compassos = 36 s exatos
BEAT = 60.0 / BPM

# (evento, id do arquivo, duração máxima em s (19.2.2), ganho de partida em dB: ADR-008 seção 4.4 ajustado
# nas regras A6(a) e A6(b) em 2026-11-09; o ajuste vale em content/audio.json, que o script preserva)
CATALOGO = [
    ("S01", "sfx_s01_passo", 0.15, -12),
    ("S02", "sfx_s02_porta", 0.5, -6),
    ("S03", "sfx_s03_porta_abriu", 1.0, -4),
    ("S04", "sfx_s04_interruptor", 0.8, -7),
    ("S05", "sfx_s05_peca", 1.0, -7),
    ("S06", "sfx_s06_encaixe", 1.5, -6),
    ("S07", "sfx_s07_au", 0.4, 0),
    ("S08", "sfx_s08_fungada", 0.5, 0),
    ("S09", "sfx_s09_conquista", 2.0, 0),
    ("S10", "sfx_s10_dialogo", 0.2, -12),
    ("S11", "sfx_s11_foco", 0.1, 0),
    ("S12", "sfx_s12_confirma", 0.2, -4),
    ("S13", "sfx_s13_erro", 0.6, -15),
]
MAX_S = {e: m for e, _, m, _ in CATALOGO}

LIM = {
    "musica_bytes": 160_000,
    "efeito_bytes": 12_000,
    "efeitos_bytes": 160_000,
    "audio_bytes": 320_000,
    "musica_min_s": 30.0,
    "musica_max_s": 40.0,
    "silencio_ms": 20.0,
    "pico_dbfs": -3.0,
}

# ---------------------------------------------------------------- síntese (numpy puro)

def tempo(n):
    return np.arange(n) / SR


def amostras(segundos):
    return int(round(segundos * SR))


def expo(n, tau, inicio=0.0):
    """Decaimento exponencial a partir de `inicio` (zero antes)."""
    t = tempo(n) - inicio
    e = np.exp(-np.maximum(t, 0.0) / tau)
    e[t < 0] = 0.0
    return e


def janela(n, ataque_s=0.002, soltura_s=0.02):
    """Sobe em `ataque_s` e desce nos últimos `soltura_s` segundos."""
    t = tempo(n)
    sobe = np.clip(t / max(ataque_s, 1e-6), 0.0, 1.0)
    desce = np.clip((n / SR - t) / max(soltura_s, 1e-6), 0.0, 1.0)
    return sobe * desce


def fim(x, ms):
    """Rampa de saída nos últimos `ms` (evita clique ao cortar)."""
    k = min(len(x), max(1, int(round(ms * SR / 1000.0))))
    x[-k:] = x[-k:] * np.linspace(1.0, 0.0, k)
    return x


def bp(x, f0, q):
    """Passa-faixa RBJ (biquad), em Python puro."""
    w0 = 2.0 * math.pi * f0 / SR
    alfa = math.sin(w0) / (2.0 * q)
    a0 = 1.0 + alfa
    b0, b1, b2 = alfa / a0, 0.0, -alfa / a0
    a1, a2 = -2.0 * math.cos(w0) / a0, (1.0 - alfa) / a0
    y = [0.0] * len(x)
    x1 = x2 = y1 = y2 = 0.0
    for i, xi in enumerate(x.tolist()):
        yi = b0 * xi + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2
        y[i] = yi
        x2, x1 = x1, xi
        y2, y1 = y1, yi
    return np.array(y)


def ruido(rng, n, f0, q):
    """Ruído filtrado em passa-faixa, normalizado para pico 1."""
    x = bp(rng.uniform(-1.0, 1.0, n), f0, q)
    return x / max(np.max(np.abs(x)), 1e-12)


def golpe(n, f0, f1, env, glide_s, amp=1.0, inicio=0.0):
    """Seno com glissando de f0 a f1 em `glide_s`, modulado por `env` (já zero antes do início)."""
    t = np.maximum(tempo(n) - inicio, 0.0)
    f = f0 + (f1 - f0) * np.clip(t / glide_s, 0.0, 1.0)
    fase = 2.0 * math.pi * np.cumsum(f) / SR
    return amp * np.sin(fase) * env


def tom(n, f, inicio, dur, ataque_s, soltura_s, amp=1.0):
    """Tom suave com terça parcial (perfil de triângulo), janela de `dur` a partir de `inicio`."""
    m = amostras(dur)
    y = np.zeros(n)
    i0 = amostras(inicio)
    k = min(m, n - i0)
    t = tempo(k)
    s = np.sin(2 * math.pi * f * t) + np.sin(2 * math.pi * 3 * f * t) / 9.0
    y[i0:i0 + k] = amp * s * janela(k, ataque_s, soltura_s)
    return y


# Parciais: (razão sobre a fundamental, amplitude, tau em s)
PARC_CELESTA = [(1.0, 1.0, 1.1), (2.0, 0.28, 0.45), (4.0, 0.12, 0.18), (6.0, 0.04, 0.08)]
PARC_SINO = [
    (0.5, 0.35, 3.0), (1.0, 1.0, 2.2), (1.003, 0.4, 1.8), (1.19, 0.45, 1.6),
    (1.56, 0.5, 1.4), (2.0, 0.35, 1.0), (2.74, 0.3, 0.7), (3.76, 0.15, 0.5),
]
LIMITE_PARCIAL_HZ = 9500.0  # abaixo de Nyquist (11.025 Hz): evita aliasing


def sino_nota(n, midi, parciais, escala=1.0, amp=1.0, inicio=0.0):
    """Nota de celesta ou de sino (síntese aditiva), com ataque de 2 ms e decaimento por parcial."""
    f0 = 440.0 * 2.0 ** ((midi - 69) / 12.0)
    t = tempo(n) - inicio
    ok = t >= 0
    tt = t[ok]
    soma = np.zeros(tt.shape)
    for razao, a, tau in parciais:
        f = f0 * razao
        if f > LIMITE_PARCIAL_HZ:
            continue
        soma += a * np.sin(2.0 * math.pi * f * tt) * np.exp(-tt / (tau * escala))
    y = np.zeros(n)
    y[ok] = amp * soma * np.minimum(tt / 0.002, 1.0)
    return y


def normalizar(x, pico=PICO_ALVO):
    return x * (pico / max(np.max(np.abs(x)), 1e-12))


# ---------------------------------------------------------------- efeitos S01 a S13

def fx_s01_passo(rng):
    n = amostras(0.13)
    y = golpe(n, 130, 95, expo(n, 0.035), 0.03, 1.0)
    y += golpe(n, 170, 120, expo(n, 0.03, 0.065), 0.03, 0.55, 0.065)
    y += 0.12 * ruido(rng, n, 900, 1.2) * expo(n, 0.008)
    return fim(y, 10)


def fx_s02_porta(rng):
    n = amostras(0.45)
    y = golpe(n, 70, 45, expo(n, 0.10), 0.08, 1.0)
    y += 0.35 * ruido(rng, n, 450, 4.0) * janela(n, 0.08, 0.12)
    return fim(y, 20)


def fx_s03_porta_abriu(rng):
    n = amostras(0.9)
    y = 0.7 * ruido(rng, n, 2500, 2.0) * expo(n, 0.004)
    y += 0.35 * ruido(rng, n, 600, 3.0) * janela(n, 0.1, 0.3)
    y += golpe(n, 95, 60, expo(n, 0.09, 0.6), 0.05, 0.5, 0.6)
    return fim(y, 50)


def fx_s04_interruptor(rng):
    n = amostras(0.75)
    y = 0.7 * ruido(rng, n, 2800, 2.0) * expo(n, 0.003)
    for i, midi in enumerate([72, 76, 79, 84]):
        y += sino_nota(n, midi, PARC_CELESTA, 0.8, 0.6, 0.05 + 0.05 * i)
    return fim(y, 30)


def fx_s05_peca(rng):
    n = amostras(0.9)
    y = np.zeros(n)
    for i, midi in enumerate([84, 88, 91, 96]):
        y += sino_nota(n, midi, PARC_CELESTA, 0.7, 0.5, 0.07 * i)
    y += 0.05 * ruido(rng, n, 6000, 1.0) * expo(n, 0.2)
    return fim(y, 50)


def fx_s06_encaixe(rng):
    n = amostras(1.3)
    y = 0.5 * ruido(rng, n, 3000, 2.0) * expo(n, 0.005)
    y += sino_nota(n, 72, PARC_SINO, 0.6, 1.0, 0.0)
    return fim(y, 80)


def fx_s07_au(rng):
    n = amostras(0.4)
    t = tempo(n)
    f = 320.0 + 240.0 * np.exp(-t / 0.05)  # latido: queda rápida de agudo a grave
    fase = 2.0 * math.pi * np.cumsum(f) / SR
    onda = sum(np.sin(k * fase) / k for k in (1, 3, 5, 7))
    y = onda * expo(n, 0.09) * janela(n, 0.003, 0.05)
    y = bp(y, 900.0, 1.5)  # formante: timbre de brinquedo
    return fim(y, 20)


def fx_s08_fungada(rng):
    n = amostras(0.5)
    r = ruido(rng, n, 1800.0, 2.0)
    env = expo(n, 0.05) + 0.7 * expo(n, 0.07, 0.12)
    return fim(r * env * janela(n, 0.003, 0.05), 20)


def fx_s09_conquista(rng):
    n = amostras(2.0)
    y = sino_nota(n, 72, PARC_SINO, 1.0, 0.6, 0.0)
    y += sino_nota(n, 76, PARC_SINO, 1.0, 0.55, 0.12)
    y += sino_nota(n, 79, PARC_SINO, 1.0, 0.55, 0.24)
    y += sino_nota(n, 84, PARC_SINO, 1.0, 0.5, 0.36)
    for midi, amp in [(84, 0.5), (88, 0.45), (91, 0.45)]:
        y += sino_nota(n, midi, PARC_CELESTA, 1.5, amp, 0.6)
    y += sino_nota(n, 72, PARC_SINO, 1.2, 0.35, 0.6)
    return fim(y, 80)


def fx_s10_dialogo(rng):
    n = amostras(0.2)
    y = golpe(n, 420, 300, expo(n, 0.06, 0.0), 0.12, 0.6)
    y += golpe(n, 840, 600, expo(n, 0.03, 0.0), 0.12, 0.1)
    return fim(y, 20)


def fx_s11_foco(rng):
    n = amostras(0.1)
    y = 0.5 * ruido(rng, n, 1500.0, 3.0) * expo(n, 0.012)
    y += 0.3 * golpe(n, 1200, 1200, expo(n, 0.012), 0.01)
    return fim(y, 10)


def fx_s12_confirma(rng):
    n = amostras(0.2)
    y = golpe(n, 1320, 1320, expo(n, 0.05), 0.01, 0.6)
    y += golpe(n, 1980, 1980, expo(n, 0.03), 0.01, 0.2)
    y += 0.4 * ruido(rng, n, 3000.0, 2.0) * expo(n, 0.004)
    return fim(y, 20)


def fx_s13_erro(rng):
    n = amostras(0.6)
    y = tom(n, 392.0, 0.0, 0.25, 0.02, 0.08)   # G4
    y += tom(n, 330.0, 0.25, 0.35, 0.02, 0.08)  # E4: dois tons descendentes, sem buzzer
    return fim(y, 30)


FX = {
    "S01": fx_s01_passo, "S02": fx_s02_porta, "S03": fx_s03_porta_abriu,
    "S04": fx_s04_interruptor, "S05": fx_s05_peca, "S06": fx_s06_encaixe,
    "S07": fx_s07_au, "S08": fx_s08_fungada, "S09": fx_s09_conquista,
    "S10": fx_s10_dialogo, "S11": fx_s11_foco, "S12": fx_s12_confirma,
    "S13": fx_s13_erro,
}

# ---------------------------------------------------------------- trilha de fundo (estilo B: sinos e celesta)

# Melodia original em dó maior (beat, duração em tempos, nota MIDI). Termina na tônica no compasso 12.
MELODIA = [
    (0, 1, 67), (1, 1, 72), (2, 2, 76),
    (4, 1, 74), (5, 1, 76), (6, 2, 72),
    (8, 1, 69), (9, 1, 72), (10, 1, 77), (11, 1, 76),
    (12, 2, 74), (14, 1, 71), (15, 1, 67),
    (16, 1, 72), (17, 1, 76), (18, 2, 79),
    (20, 1, 81), (21, 1, 79), (22, 1, 76), (23, 1, 72),
    (24, 1, 74), (25, 1, 77), (26, 2, 81),
    (28, 1, 79), (29, 1, 77), (30, 1, 74), (31, 1, 71),
    (32, 2, 72), (34, 1, 76), (35, 1, 67),
    (36, 1, 69), (37, 1, 72), (38, 2, 77),
    (40, 1, 76), (41, 1, 74), (42, 1, 71), (43, 1, 74),
    (44, 4, 72),
]
# Acorde de cada compasso: (nota do baixo, tons do acorde)
ACORDES = {
    "C": (48, [64, 67, 72]),
    "Am": (45, [60, 64, 69]),
    "F": (41, [60, 65, 69]),
    "G": (43, [59, 62, 67]),
    "Dm": (50, [57, 62, 65]),
}
COMPASSOS = ["C", "Am", "F", "G", "C", "Am", "Dm", "G", "C", "F", "G", "C"]


def soma_laco(buf, sinal, inicio):
    """Soma `sinal` em `buf` como laço: o que passa do fim volta ao início (emenda sem corte)."""
    n = len(buf)
    idx = (inicio + np.arange(len(sinal))) % n
    buf[idx] += sinal


def musica_final():
    n = amostras(MUS_SEG)
    buf = np.zeros(n)
    for beat, dur, midi in MELODIA:
        ini = round(beat * BEAT * SR)
        s = sino_nota(amostras(dur * BEAT + 1.6), midi, PARC_CELESTA, 1.0, 0.55, 0.0)
        soma_laco(buf, fim(s, 60), ini)
    for b, nome in enumerate(COMPASSOS):
        raiz, tons = ACORDES[nome]
        ini_c = round(b * 4 * BEAT * SR)
        soma_laco(buf, fim(sino_nota(amostras(4.0), raiz, PARC_SINO, 1.0, 0.5), 80), ini_c)
        ini_t = round((b * 4 + 2) * BEAT * SR)
        for midi in tons:
            soma_laco(buf, fim(sino_nota(amostras(3.0), midi, PARC_SINO, 0.8, 0.16), 80), ini_t)
        for k, tempo_off in enumerate([1, 3]):
            ini_a = round((b * 4 + tempo_off) * BEAT * SR)
            midi = tons[k % 3] + 12
            soma_laco(buf, fim(sino_nota(amostras(2.0), midi, PARC_CELESTA, 0.7, 0.22), 60), ini_a)
    return normalizar(buf)


def musica_rascunho():
    """Trilha de rascunho: 36 s, acordes de senos nos mesmos compassos (só para o Dev integrar)."""
    n = amostras(MUS_SEG)
    buf = np.zeros(n)
    for b, nome in enumerate(COMPASSOS):
        _, tons = ACORDES[nome]
        ini = round(b * 4 * BEAT * SR)
        for midi in tons:
            f = 440.0 * 2.0 ** ((midi - 69) / 12.0)
            s = 0.3 * np.sin(2 * math.pi * f * tempo(amostras(3.0)))
            soma_laco(buf, fim(s * janela(len(s), 0.02, 0.05), 50), ini)
    return normalizar(buf)


def efeito_rascunho(indice, max_s):
    n = amostras(max_s * 0.6)
    f = 440.0 * 2.0 ** (indice / 12.0)
    y = np.sin(2 * math.pi * f * tempo(n)) * janela(n, 0.005, min(0.05, max_s / 3))
    return normalizar(y)


def gerar_pcm(rascunho):
    """Devolve {id do arquivo: (evento ou None, PCM float64 normalizado)}, na ordem do catálogo."""
    saida = {}
    saida[MUS_ID] = (None, musica_rascunho() if rascunho else musica_final())
    for k, (evento, arq, max_s, _) in enumerate(CATALOGO):
        if rascunho:
            pcm = efeito_rascunho(k, max_s)
        else:
            rng = np.random.default_rng(SEMENTE + k)
            pcm = normalizar(FX[evento](rng))
        if len(pcm) / SR > max_s + 1e-9:
            raise SystemExit(f"{evento}: {len(pcm) / SR:.3f} s, passa do máximo de {max_s} s (19.2.2)")
        saida[arq] = (evento, pcm)
    saida.update(jingles_rascunho() if rascunho else jingles_final())
    return saida


# ---------------------------------------------------------------- jingles (GDD 19.2.7; ajuste 0.12.0, retorno do PT5)

# Durações do conteúdo em s. Orçamento: 63.500 B somados para J01 a J05, e cada um abaixo de 16.000 B; cada
# arquivo gasta ~4.000 B por segundo mais ~460 B de cabeçalho (encoder, quadro Info, ID3).
JINGLE_DUR = {"J01": 2.5, "J02": 3.0, "J03": 3.0, "J04": 3.0, "J05": 3.6}
JC_DUR = 15.5
JINGLE_ARQ = {
    "J01": "jin_j01_luzes", "J02": "jin_j02_parte1", "J03": "jin_j03_parte2",
    "J04": "jin_j04_parte3", "J05": "jin_j05_enfeites", "JC": "jin_jc_natal",
}
JINGLE_GANHO_CONQUISTA = 0.0  # desvio do GDD 19.2.7 d (-2 dB): com -2 dB as conquistas ficavam 4 dB abaixo do S09
JINGLE_GANHO_JC = -2.0        # GDD 19.2.7 d: jingle de créditos em -2 dB
LIM_JINGLE = {"cada_bytes": 16_000, "somados_bytes": 63_500, "jc_bytes": 64_000}


# J01 luzes: dó maior, só celesta, arpejo ascendente rápido (caixinha de música); fecha em dó com a quinta aberta.
def jin_j01(n):
    y = np.zeros(n)
    for i, midi in enumerate([72, 76, 79, 84, 88, 91]):
        y += sino_nota(n, midi, PARC_CELESTA, 0.9, 0.45, 0.07 * i)
    y += sino_nota(n, 79, PARC_CELESTA, 0.7, 0.4, 0.42)
    y += sino_nota(n, 84, PARC_CELESTA, 2.0, 0.5, 0.55)
    y += sino_nota(n, 72, PARC_CELESTA, 2.0, 0.35, 0.55)
    return fim(y, 120)


# J02 parte 1: sol maior, tercinas de celesta (sol-si-ré) em três grupos, depois sino grave no sol.
def jin_j02(n):
    y = np.zeros(n)
    for g in range(3):
        for k, midi in enumerate([79, 83, 86]):
            y += sino_nota(n, midi, PARC_CELESTA, 0.7, 0.4, g * 0.36 + k * 0.12)
    for midi, amp in ((55, 0.45), (62, 0.25), (67, 0.2)):
        y += sino_nota(n, midi, PARC_SINO, 2.2, amp, 1.1)
    return fim(y, 120)


# J03 parte 2: fá maior, só sinos, fanfarra em quintas (fá-dó, dó-sol, fá-dó agudo) e acorde final de fá.
def jin_j03(n):
    y = np.zeros(n)
    for inicio, notas in ((0.0, (53, 60)), (0.5, (60, 67)), (1.0, (65, 72)), (1.5, (53, 60, 65, 72))):
        for midi in notas:
            y += sino_nota(n, midi, PARC_SINO, 1.8, 0.4, inicio)
    return fim(y, 150)


# J04 parte 3: ré maior, só sinos, acordes largos com tremolo (si menor, lá maior, ré maior), fecho em ré.
def jin_j04(n):
    acordes = [(0.0, (59, 62, 66)), (1.0, (57, 61, 64)), (2.0, (62, 66, 69))]
    y = np.zeros(n)
    for inicio, notas in acordes:
        for k in range(5):
            for midi in notas:
                y += sino_nota(n, midi, PARC_SINO, 1.2, 0.22, inicio + 0.2 * k)
    return fim(y, 150)


# J05 enfeites: dó maior, escala de celesta cheia e brilho, citação de 4 notas de "Jingle Bells" (E E E G),
# cadência final com quinta aberta (dó-sol, sem terça): final aberto.
def jin_j05(n):
    y = np.zeros(n)
    for i, midi in enumerate([72, 74, 76, 77, 79, 81, 83, 84]):
        y += sino_nota(n, midi, PARC_CELESTA, 0.6, 0.35, 0.07 * i)
    for i, midi in enumerate([76, 76, 76, 79]):
        y += sino_nota(n, midi, PARC_CELESTA, 0.6, 0.45, 0.7 + 0.25 * i)
    for midi in (48, 55):
        y += sino_nota(n, midi, PARC_SINO, 2.0, 0.4, 2.0)
    for midi in (60, 67, 72):
        y += sino_nota(n, midi, PARC_SINO, 2.2, 0.25, 2.0)
    y += sino_nota(n, 84, PARC_CELESTA, 1.8, 0.3, 2.0)
    return fim(y, 120)


# JC: "We Wish You a Merry Christmas" (melodia tradicional inglesa, domínio público), arranjo original do projeto.
# Sol maior, 3/4 a 128 BPM (compasso de 1,4 s), 11 compassos. Frases: "We wish you a merry Christmas" x3,
# "and a happy New Year", "Good tidings we bring...". Notas: (compasso, tempo, duração em tempos, MIDI).
JC_BAR = 1.4
JC_BEAT = JC_BAR / 3.0
_LINHA = [(0, 0, 1, 74), (0, 1, 1, 79), (0, 2, 1, 79), (1, 0, 1, 81), (1, 1, 1, 79), (1, 2, 1, 78)]
JC_MELODIA = (
    _LINHA
    + [(c + 2, t, d, m) for c, t, d, m in _LINHA]
    + [(c + 4, t, d, m) for c, t, d, m in _LINHA]
    + [(6, 0, 1, 76), (6, 1, 1, 76), (6, 2, 1, 74), (7, 0, 3, 74)]
    + [(8, 0, 1, 79), (8, 1, 1, 79), (8, 2, 1, 81), (9, 0, 1, 79), (9, 1, 1, 78), (9, 2, 1, 76), (10, 0, 3, 79)]
)
JC_ACORDES = ["G", "D", "G", "D", "G", "D", "C", "D", "Em", "C", "G"]
ACORDES_JC = {"G": (43, [59, 62, 67]), "D": (38, [57, 62, 66]), "C": (36, [60, 64, 67]), "Em": (40, [59, 64, 67])}


def jingle_natal():
    n = amostras(JC_DUR)
    buf = np.zeros(n)
    for c, t, d, m in JC_MELODIA:
        ini = round((c * 3 + t) * JC_BEAT * SR)
        sig = fim(sino_nota(amostras(d * JC_BEAT + 1.2), m, PARC_CELESTA, 1.0, 0.5, 0.0), 40)
        buf[ini:ini + len(sig)] += sig[: n - ini]
    for c, nome in enumerate(JC_ACORDES):
        raiz, tons = ACORDES_JC[nome]
        ini = round(c * 3 * JC_BEAT * SR)
        sig = fim(sino_nota(amostras(2.8), raiz, PARC_SINO, 1.3, 0.4, 0.0), 60)
        buf[ini:ini + len(sig)] += sig[: n - ini]
        for k, midi in enumerate(tons[1:]):
            ini2 = round((c * 3 + 1 + k) * JC_BEAT * SR)
            sig = fim(sino_nota(amostras(2.2), midi, PARC_SINO, 0.9, 0.17, 0.0), 60)
            buf[ini2:ini2 + len(sig)] += sig[: n - ini2]
    return normalizar(fim(buf, 150))  # rampa de saída de 150 ms: sem clique no fim


FXJ = {"J01": jin_j01, "J02": jin_j02, "J03": jin_j03, "J04": jin_j04, "J05": jin_j05}


def jingle_conquista(evento):
    n = amostras(JINGLE_DUR[evento])
    return normalizar(FXJ[evento](n))


def jingles_rascunho():
    """Jingles de rascunho: um tom por jingle, com a duração do final. Só para o Dev integrar."""
    saida = {}
    for k, evento in enumerate(JINGLE_DUR):
        saida[JINGLE_ARQ[evento]] = (evento, efeito_rascunho(k + 12, JINGLE_DUR[evento]))
    saida[JINGLE_ARQ["JC"]] = ("JC", efeito_rascunho(20, JC_DUR))
    return saida


def jingles_final():
    saida = {}
    for evento in JINGLE_DUR:
        saida[JINGLE_ARQ[evento]] = (evento, jingle_conquista(evento))
    saida[JINGLE_ARQ["JC"]] = ("JC", jingle_natal())
    return saida


# ---------------------------------------------------------------- codificação e medidas

def sha256(b):
    return hashlib.sha256(b).hexdigest()


def pcm_i16(pcm):
    return np.clip(np.round(pcm * 32767.0), -32768, 32767).astype("<i2")


def checar_ffmpeg():
    if shutil.which("ffmpeg") is None:
        raise SystemExit("ffmpeg não encontrado. Instale com: brew install ffmpeg")
    enc = subprocess.run(["ffmpeg", "-hide_banner", "-encoders"], capture_output=True, text=True).stdout
    if "libmp3lame" not in enc:
        raise SystemExit("ffmpeg sem libmp3lame. Reinstale o ffmpeg com suporte a MP3.")
    v = subprocess.run(["ffmpeg", "-version"], capture_output=True, text=True).stdout.splitlines()[0]
    return v.split(" Copyright")[0].strip()


def codificar(pcm, mp3, tmp, nome):
    wav = tmp / f"{nome}.wav"
    i16 = pcm_i16(pcm)
    with wave.open(str(wav), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(i16.tobytes())
    subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(wav),
         "-map_metadata", "-1", "-c:a", "libmp3lame", "-b:a", f"{KBPS}k",
         "-ac", "1", "-ar", str(SR), str(mp3)],
        check=True,
    )
    return sha256(i16.tobytes())


def decodificar(mp3):
    r = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(mp3), "-f", "f32le", "-ac", "1", "-ar", str(SR), "pipe:1"],
        capture_output=True, check=True,
    )
    return np.frombuffer(r.stdout, dtype="<f4").astype(np.float64)


def ler_atraso_preenchimento(mp3):
    """Atraso inicial e preenchimento final (em amostras), como o encoder declara ao decodificador.

    Lidos dos side data "Skip Samples" do primeiro e do último pacote (ffprobe). O ffmpeg 7 com libmp3lame
    não grava o campo do atraso na tag LAME, então a tag não serve; os side data trazem o mesmo valor (1105 e
    o preenchimento). Confere: pacotes x 576 = atraso + amostras + preenchimento.
    """
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_packets", "-of", "json", str(mp3)],
        capture_output=True, text=True, check=True,
    )
    pacotes = json.loads(r.stdout)["packets"]

    def lado(pacote, chave):
        for sd in pacote.get("side_data_list", []) or []:
            if sd.get("side_data_type") == "Skip Samples":
                return int(sd.get(chave, 0))
        return 0

    return lado(pacotes[0], "skip_samples"), lado(pacotes[-1], "discard_padding"), len(pacotes)


def info_mp3(mp3):
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries",
         "stream=codec_name,channels,sample_rate,bit_rate", "-of", "json", str(mp3)],
        capture_output=True, text=True, check=True,
    )
    s = json.loads(r.stdout)["streams"][0]
    return {
        "codec": s["codec_name"], "canais": int(s["channels"]),
        "taxaHz": int(s["sample_rate"]), "bitRate": int(s.get("bit_rate", 0)),
    }


def db(v):
    return 20.0 * math.log10(max(v, 1e-12))


def medir(x, loop=False):
    pico = float(np.max(np.abs(x)))
    rms = float(np.sqrt(np.mean(x ** 2)))
    nz = np.nonzero(np.abs(x) > 10 ** (-60 / 20))[0]
    ini_ms = nz[0] / SR * 1000.0 if len(nz) else len(x) / SR * 1000.0
    fim_ms = (len(x) - 1 - nz[-1]) / SR * 1000.0 if len(nz) else len(x) / SR * 1000.0
    m = {
        "amostras": int(len(x)),
        "duracaoS": round(len(x) / SR, 4),
        "picoDbfs": round(db(pico), 2),
        "rmsDbfs": round(db(rms), 2),
        "silencioInicialMs": round(ini_ms, 2),
        "silencioFinalMs": round(fim_ms, 2),
    }
    if loop:
        salto = abs(float(x[0]) - float(x[-1]))
        tipico = float(np.percentile(np.abs(np.diff(x)), 99))
        m["emendaSaltoRelativo"] = round(salto / max(tipico, 1e-12), 3)
    return m


# ---------------------------------------------------------------- regras (ADR-008 seção 8.2)

def avaliar(efeitos, musica, ganhos, mestre):
    """efeitos: {evento: meta}; musica: meta; ganhos: {evento ou 'musica': dB}. Devolve lista de (ok, texto)."""
    fator = 20.0 * math.log10(mestre)
    res = []
    ef_rms = {e: m["rmsDbfs"] + ganhos[e] + fator for e, m in efeitos.items()}
    ef_pico = {e: 10 ** ((m["picoDbfs"] + ganhos[e] + fator) / 20.0) for e, m in efeitos.items()}
    mus_rms = musica["rmsDbfs"] + ganhos["musica"] + fator
    media_db = sum(ef_rms.values()) / len(ef_rms)
    media_pot = 10 * math.log10(sum(10 ** (v / 10) for v in ef_rms.values()) / len(ef_rms))
    dif = mus_rms - media_db
    res.append((7.0 <= -dif <= 13.0,
                f"A6(a) música {dif:+.2f} dB em relação à média dos efeitos (em dB); exigido entre -13 e -7 "
                f"(média em potência: {mus_rms - media_pot:+.2f} dB)"))
    ordem = sorted(ef_rms, key=lambda e: ef_rms[e])
    baixos, altos = set(ordem[:2]), set(ordem[-2:])
    res.append((baixos == {"S01", "S10"}, f"A6(b) dois mais baixos: {sorted(baixos)} (exigido S01 e S10)"))
    res.append((altos == {"S07", "S09"}, f"A6(b) dois mais altos: {sorted(altos)} (exigido S07 e S09)"))
    topo3 = sum(sorted(ef_pico.values(), reverse=True)[:3])
    pico_mus = 10 ** ((musica["picoDbfs"] + ganhos["musica"] + fator) / 20.0)
    soma = topo3 + pico_mus
    res.append((soma <= 1.0, f"A6(c) soma dos 3 picos efetivos mais altos + música: {soma:.3f} (limite 1,0)"))
    for e, m in efeitos.items():
        res.append((m["picoDbfs"] <= LIM["pico_dbfs"], f"A5 {e} pico {m['picoDbfs']} dBFS (limite -3,0)"))
    res.append((LIM["musica_min_s"] <= musica["duracaoS"] <= LIM["musica_max_s"],
                f"A4 música {musica['duracaoS']} s (30 a 40)"))
    res.append((musica["silencioInicialMs"] <= LIM["silencio_ms"] and musica["silencioFinalMs"] <= LIM["silencio_ms"],
                f"A7 silêncio nas pontas da música: {musica['silencioInicialMs']} ms e "
                f"{musica['silencioFinalMs']} ms (limite 20)"))
    res.append((musica["bytes"] <= LIM["musica_bytes"], f"A4 música {musica['bytes']} bytes (limite 160.000)"))
    for e, m in efeitos.items():
        res.append((m["bytes"] <= LIM["efeito_bytes"] and m["duracaoS"] <= MAX_S[e] + 1e-6,
                    f"A4 {e} {m['bytes']} bytes, {m['duracaoS']} s (máx. {MAX_S[e]} s e 12.000 bytes)"))
    ef_total = sum(m["bytes"] for m in efeitos.values())
    res.append((ef_total <= LIM["efeitos_bytes"], f"A4 efeitos somados {ef_total} bytes (limite 160.000)"))
    tot = ef_total + musica["bytes"]
    res.append((tot <= LIM["audio_bytes"], f"A4 áudio total {tot} bytes (limite 320.000)"))
    res.append((all(-40 <= g <= 0 for g in ganhos.values()) and 0 < mestre <= 1,
                "A3 ganhos em [-40, 0] dB e mestre em (0, 1]"))
    return res


def avaliar_jingles(jingles, jc, efeitos, musica, ganhos, mestre):
    """Orçamento dos jingles (GDD 19.2.7 e) e mixagem (regra c com os jingles entre os efeitos). Lista (ok, texto)."""
    res = []
    fator = 20.0 * math.log10(mestre)
    ganho_j = {**{e: JINGLE_GANHO_CONQUISTA for e in jingles}, "JC": JINGLE_GANHO_JC}
    for e, m in jingles.items():
        res.append((m["bytes"] <= LIM_JINGLE["cada_bytes"],
                    f"J {e} {m['bytes']} bytes (limite 16.000); {m['duracaoS']} s"))
        res.append((m["picoDbfs"] <= LIM["pico_dbfs"], f"J {e} pico {m['picoDbfs']} dBFS (limite -3,0)"))
    soma_j = sum(m["bytes"] for m in jingles.values())
    res.append((soma_j <= LIM_JINGLE["somados_bytes"], f"J01 a J05 somados {soma_j} bytes (limite 63.500)"))
    res.append((jc["bytes"] <= LIM_JINGLE["jc_bytes"], f"JC {jc['bytes']} bytes, {jc['duracaoS']} s (limite 64.000; 12 a 16 s)"))
    res.append((jc["picoDbfs"] <= LIM["pico_dbfs"], f"JC pico {jc['picoDbfs']} dBFS (limite -3,0)"))
    res.append((12.0 <= jc["duracaoS"] <= 16.0, f"JC duração {jc['duracaoS']} s (12 a 16)"))
    # Mixagem: níveis efetivos dos jingles contra os efeitos e a música (ADR-008 4.3, regra c com jingles)
    todos = {**{e: m for e, m in efeitos.items()}, **jingles, "JC": jc}
    ganho = {**{e: ganhos[e] for e in efeitos}, **ganho_j}
    rms = {e: m["rmsDbfs"] + ganho[e] + fator for e, m in todos.items()}
    pico = {e: 10 ** ((m["picoDbfs"] + ganho[e] + fator) / 20.0) for e, m in todos.items()}
    ordem = sorted(rms, key=lambda e: -rms[e])
    s09 = rms["S09"]
    acima = [e for e in jingles if rms[e] >= s09 - 3.0]
    res.append((len(acima) == len(jingles),
                "jingles de conquista entre os mais altos (até 3 dB abaixo do S09): " +
                ", ".join(f"{e} {rms[e]:.1f}" for e in sorted(jingles)) + f" (S09 {s09:.1f})"))
    topo3 = sum(sorted(pico.values(), reverse=True)[:3])
    pico_mus = 10 ** ((musica["picoDbfs"] + ganhos["musica"] + fator) / 20.0)
    res.append((topo3 + pico_mus <= 1.0,
                f"regra c com jingles: 3 picos efetivos mais altos + música = {topo3 + pico_mus:.3f} (limite 1,0)"))
    res.append((True, "ordem de nível efetivo (informativo): " + ", ".join(f"{e} {rms[e]:.1f}" for e in ordem[:6])))
    return res


def escrever_proposta_jingles():
    """Rascunho de trecho do content/audio.json para a revisão 2 do ADR-008. content/audio.json NÃO é alterado."""
    dados = {
        "_status": "proposta da Arte (2026-11-10, item 143). Não é content/audio.json. O Especialista escreve a "
                   "revisão 2 do ADR-008 e o Dev integra o schema.",
        "conquistas": {
            "duckingDb": -8, "duckingEntradaS": 0.3, "duckingSaidaS": 0.5,
            "eventos": {e: {"id": JINGLE_ARQ[e], "ganhoDb": JINGLE_GANHO_CONQUISTA} for e in JINGLE_DUR},
            "chave": {"J01": "conquista.luzes", "J02": "conquista.parte1", "J03": "conquista.parte2",
                      "J04": "conquista.parte3", "J05": "conquista.enfeites"},
        },
        "creditos": {"id": JINGLE_ARQ["JC"], "ganhoDb": JINGLE_GANHO_JC, "loop": False,
                     "duckingDb": -10, "duckingEntradaS": 0.5, "duckingSaidaS": 0.5},
        "melodias": {
            "JC": "We Wish You a Merry Christmas: melodia tradicional (domínio público); arranjo original",
            "J05": "citação de Jingle Bells (1857, domínio público), mi-mi-mi-sol; resto original",
        },
        "limites": {"jingleBytes": LIM_JINGLE["cada_bytes"], "jingleSomadosBytes": LIM_JINGLE["somados_bytes"],
                    "jcBytes": LIM_JINGLE["jc_bytes"]},
    }
    (PASTA_AUDIO / "audio-jingles-proposta.json").write_text(
        json.dumps(dados, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


# ---------------------------------------------------------------- conteúdo e documentação

def ganhos_atuais():
    """Ganhos e mestre de content/audio.json, se existir; senão, os padrões do ADR-008 seção 4.4."""
    padrao = {e: g for e, _, _, g in CATALOGO}
    padrao["musica"] = MUS_GANHO_PADRAO
    if ARQ_CONTEUDO.exists():
        atual = json.loads(ARQ_CONTEUDO.read_text(encoding="utf-8"))
        mestre = float(atual.get("mestre", MESTRE_PADRAO))
        ganhos = {"musica": float(atual["musica"]["ganhoDb"])}
        for e, _, _, _ in CATALOGO:
            ganhos[e] = float(atual["eventos"][e]["ganhoDb"])
        return mestre, ganhos
    return MESTRE_PADRAO, padrao


def escrever_conteudo(mestre, ganhos):
    dados = {
        "mestre": mestre,
        "musica": {"id": MUS_ID, "ganhoDb": ganhos["musica"], "loop": True},
        "eventos": {e: {"id": arq, "ganhoDb": ganhos[e]} for e, arq, _, _ in CATALOGO},
    }
    ARQ_CONTEUDO.parent.mkdir(parents=True, exist_ok=True)
    ARQ_CONTEUDO.write_text(json.dumps(dados, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def escrever_licencas(metas, rascunho, data):
    estado = ("RASCUNHO (tons de teste para o Dev integrar; trocar pela versão final antes do build de release)"
              if rascunho else
              "Versão final. Trilha no estilo B (sinos e celesta sintetizados, GDD 19.2.1), escolhido pelo Diretor "
              "na pergunta 44; aprovação da faixa pelo Diretor pendente (backlog 123, critério 7)")
    linhas = [
        "# Origem e licença do áudio (Marco 6)",
        "",
        f"- **Data:** {data}",
        f"- **Gerado por:** `tools-arte/gerar_audio.py` (não editar os arquivos à mão)",
        f"- **Estado:** {estado}",
        "- **Regra (GDD 19.2.5; ADR-008):** o áudio é síntese original do projeto (sem sample, faixa ou trecho de terceiros). "
        "Exceções declaradas abaixo: as melodias tradicionais de domínio público do JC e da citação de J05. A trilha "
        "de fundo (`mus_natal`) e os efeitos são composição própria.",
        "- **Autor:** Arte do projeto (agente de arte e level design), pelo script acima.",
        "",
        "## Origem das melodias (exceções de domínio público)",
        "",
        "- **JC (jingle de créditos, `jin_jc_natal.mp3`):** melodia tradicional de \"We Wish You a Merry Christmas\" "
        "(carol inglês, registrado no século XVI; domínio público). O arranjo, o tempo (3/4), a tonalidade (sol maior) e "
        "a instrumentação (sinos e celesta) são originais do projeto. **Não** se usa o arranjo de Arthur Warrell (1935), "
        "que tem direitos.",
        "- **J05 (conquista de enfeites, `jin_j05_enfeites.mp3`):** citação de 4 notas (mi, mi, mi, sol) de \"Jingle Bells\" "
        "(melodia de James Lord Pierpont, publicada em 1857; domínio público). O restante do jingle é original.",
        "- **Demais arquivos** (trilha, efeitos S01 a S13, J01 a J04): composição própria, sem melodia de terceiros.",
        "",
        f"- **Formato:** MP3 mono, {SR} Hz, CBR {KBPS} kbps. Medidas em `assets/audio/audio-meta.json`.",
        "",
        "| Arquivo | Evento | Origem | Data | Bytes | Duração (s) |",
        "|---|---|---|---|---|---|",
    ]
    for m in metas:
        evento = m["evento"] or "trilha de fundo (loop)"
        if evento and evento.startswith("J"):
            evento = f"{evento} (jingle, GDD 19.2.7)"
        linhas.append(f"| `{m['arquivo']}` | {evento} | {ORIGEM} | {data} | {m['bytes']} | {m['duracaoS']:.3f} |")
    linhas.append("")
    ARQ_LICENCAS.parent.mkdir(parents=True, exist_ok=True)
    ARQ_LICENCAS.write_text("\n".join(linhas), encoding="utf-8")


# ---------------------------------------------------------------- fluxo principal

def verificar():
    """Recalcula o PCM em memória e compara com o SHA-256 do meta (não escreve nada)."""
    if not ARQ_META.exists():
        raise SystemExit("audio-meta.json não existe: rode o script sem --verificar antes.")
    meta = json.loads(ARQ_META.read_text(encoding="utf-8"))
    rascunho = bool(meta.get("rascunho", False))
    ok = True
    for arq, pcm in gerar_pcm(rascunho).items():
        registro = next((r for r in meta["arquivos"] if r["arquivo"] == f"{arq}.mp3"), None)
        if registro is None:
            print(f"Sem registro no meta: {arq}.mp3")
            ok = False
            continue
        atual = sha256(pcm_i16(pcm[1]).tobytes())
        bate = atual == registro["sha256Pcm"]
        ok = ok and bate
        print(f"{'OK ' if bate else 'DIFF'} {arq}")
    # AU10 (GDD 19.9): pico de cada arquivo em -3 dBFS ou menos. Lido do audio-meta.json, que o script gera.
    for r in meta["arquivos"]:
        pico = r.get("picoDbfs")
        if pico is None or pico > -3.0:
            print(f"AU10 FALHA: {r['arquivo']} com pico de {pico} dBFS (limite -3).")
            ok = False
    if not any(r.get("picoDbfs") is not None and r["arquivo"].startswith("mus_") for r in meta["arquivos"]):
        print("AU10 FALHA: trilha sem registro de pico no meta.")
        ok = False
    else:
        pior = max(r["picoDbfs"] for r in meta["arquivos"] if r.get("picoDbfs") is not None)
        print(f"OK  AU10 pico de todos os arquivos em -3 dBFS ou menos (maior: {pior} dBFS)")
    # AU11 (GDD 19.9): silêncio no início e no fim da trilha em 20 ms ou menos (laço sem buraco; ADR-008 1.4).
    trilha = next((r for r in meta["arquivos"] if r["arquivo"].startswith("mus_")), None)
    if trilha is None or "silencioInicialMs" not in trilha or "silencioFinalMs" not in trilha:
        print("AU11 FALHA: trilha sem medidas de silêncio no meta.")
        ok = False
    else:
        for campo in ("silencioInicialMs", "silencioFinalMs"):
            if trilha[campo] > 20.0:
                print(f"AU11 FALHA: trilha com {trilha[campo]} ms de silêncio ({campo}; limite 20 ms).")
                ok = False
        if trilha["silencioInicialMs"] <= 20.0 and trilha["silencioFinalMs"] <= 20.0:
            print(f"OK  AU11 silêncio da trilha: {trilha['silencioInicialMs']} ms no início e {trilha['silencioFinalMs']} ms no fim (limite 20).")
    return 0 if ok else 1


def main(argv):
    if "--verificar" in argv:
        return verificar()
    rascunho = "--rascunho" in argv
    versao = checar_ffmpeg()
    mestre, ganhos = ganhos_atuais()
    pcms = gerar_pcm(rascunho)
    PASTA_AUDIO.mkdir(parents=True, exist_ok=True)
    data = datetime.date.today().isoformat()
    metas = []
    with tempfile.TemporaryDirectory(prefix="gerar_audio_") as tmpdir:
        tmp = Path(tmpdir)
        for arq, (evento, pcm) in pcms.items():
            mp3 = PASTA_AUDIO / f"{arq}.mp3"
            sha_pcm = codificar(pcm, mp3, tmp, arq)
            dados = mp3.read_bytes()
            x = decodificar(mp3)
            atraso, pad, pacotes = ler_atraso_preenchimento(mp3)
            total = pacotes * 576  # quadro MPEG-2 layer III (22.050 Hz) = 576 amostras
            if total != len(x) + atraso + pad:
                raise SystemExit(f"{arq}: pacotes x 576 ({total}) não bate com atraso + amostras + preenchimento "
                                 f"({atraso} + {len(x)} + {pad}); não gravar o meta")
            info = info_mp3(mp3)
            m = {
                "arquivo": f"{arq}.mp3", "evento": evento, "rascunho": rascunho,
                "bytes": len(dados), "sha256Pcm": sha_pcm, "sha256Mp3": sha256(dados),
                "atrasoInicial": atraso, "preenchimentoFinal": pad,
                "amostrasNoArquivo": int(total),
                "origem": ORIGEM, "data": data,
                **info,
                **medir(x, loop=(arq == MUS_ID)),
            }
            if arq == MUS_ID:
                # ADR-008 1.4: se o navegador aparou o atraso, o laço é [0, N); se não, [atraso, total - preenchimento)
                m["loopSeAparado"] = [0, int(len(x))]
                m["loopSeNaoAparado"] = [atraso, int(total - pad)]
            metas.append(m)
            print(f"{arq}: {len(dados)} bytes, {m['duracaoS']:.3f} s, pico {m['picoDbfs']} dBFS, "
                  f"RMS {m['rmsDbfs']} dBFS")
    meta_total = {
        "gerador": "tools-arte/gerar_audio.py", "rascunho": rascunho, "ffmpeg": versao,
        "numpy": np.__version__, "semente": SEMENTE, "taxaHz": SR, "kbps": KBPS,
        "mestre": mestre, "data": data,
        "arquivos": metas,
    }
    PASTA_AUDIO.mkdir(parents=True, exist_ok=True)
    ARQ_META.write_text(json.dumps(meta_total, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    escrever_conteudo(mestre, ganhos)
    escrever_licencas(metas, rascunho, data)

    por_id = {m["arquivo"][:-4]: m for m in metas}
    musica = por_id[MUS_ID]
    efeitos = {m["evento"]: m for m in metas if m["evento"] and m["evento"].startswith("S")}
    jingles = {m["evento"]: m for m in metas if m["evento"] and m["evento"].startswith("J")}
    jc = jingles.pop("JC")
    resultados = avaliar(efeitos, musica, ganhos, mestre)
    resultados += avaliar_jingles(jingles, jc, efeitos, musica, ganhos, mestre)
    falhas = [t for ok, t in resultados if not ok]
    for ok, t in resultados:
        print(("OK   " if ok else "FALHA ") + t)
    escrever_proposta_jingles()
    total = sum(m["bytes"] for m in metas)
    print(f"Áudio total: {total} bytes ({total / 1000:.1f} KB) de 320 KB.")
    if falhas and not rascunho:
        return 1
    if falhas and rascunho:
        print("(rascunho: regras de mixagem não são exigidas nesta versão)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
