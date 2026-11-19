"""Bateria C1 a C10 do conversor (ADR-011 seção 8). Biblioteca padrão.

    python3 -m unittest discover -s tools-arte/testes -v
"""
import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from auxiliar import GIDS, area, c, codigos, construir_tmx, converter_texto  # noqa: E402

RAIZ = Path(__file__).resolve().parent.parent.parent
REAL = RAIZ / "maps" / "casa-real" / "home-v2-jogo.tmx"
DADOS = Path(__file__).resolve().parent / "dados"
BIT = c.BIT


def mascara(res, ident, x, y):
    s = area(res, ident)["doc"]
    return s["paredes"][y * s["largura"] + x]


def invariantes(doc):
    """Invariantes 1 a 4 da seção 2.1 e as portas (3): devolve a lista de falhas."""
    falhas = []
    w, h = doc["largura"], doc["altura"]
    for y in range(h):
        for x in range(w):
            i = y * w + x
            m = doc["paredes"][i]
            if not 0 <= m <= 15:
                falhas.append(f"({x},{y}) máscara fora de 0 a 15")
            if doc["chao"][i] == 0:
                if m != 0:
                    falhas.append(f"({x},{y}) sem piso com máscara {m}")
                continue
            for lado, (dx, dy) in c.DIRECOES.items():
                nx, ny = x + dx, y + dy
                dentro = 0 <= nx < w and 0 <= ny < h and doc["chao"][ny * w + nx] > 0
                bit = bool(m & BIT[lado])
                if not dentro and not bit:
                    falhas.append(f"({x},{y}) fronteira {lado} sem parede")
                if dentro and bit != bool(doc["paredes"][ny * w + nx] & BIT[c.OPOSTO[lado]]):
                    falhas.append(f"({x},{y}) assimetria {lado}")
    for o in doc["objetos"]:
        if o["tipo"] == "porta" and not doc["paredes"][o["y"] * w + o["x"]] & BIT[o["lado"]]:
            falhas.append(f"porta {o['id']} sem parede na aresta")
    return falhas


class C1_PlantaNova(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.col = c.Coletor("home-v2-jogo.tmx")
        cls.res = c.converter(REAL, c.carregar_perfil("hd-480x352"), cls.col, True)

    def test_sem_erro(self):
        self.assertIsNotNone(self.res, self.col.erros)

    def test_pl1_tiles_por_area(self):
        # Cozinha 30: layout do Diretor de 2026-11-17 (Cozinha com 3 linhas e Lavanderia com 2, caixa 6×5); era 24 em home_v2.tmx
        esperado = {"hall": 8, "sala": 70, "cozinha": 30, "quarto": 13, "escritorio": 17,
                    "quarto_casal": 24, "banheiro1": 12, "banheiro_escritorio": 4, "quartinho": 6}
        obtido = {s["id"]: s["contagens"]["piso"] for s in self.res["subareas"]}
        self.assertEqual(esperado, obtido)

    def test_pl2_nove_portas(self):
        ids = sorted({p["id"] for s in self.res["subareas"] for p in s["portas"]})
        self.assertEqual(sorted(["hall-sala", "cozinha-sala", "escritorio-sala", "quarto-sala", "quarto_casal-sala",
                                 "banheiro1-quarto", "banheiro_escritorio-escritorio", "cozinha-quartinho",
                                 "banheiro1-quarto_casal"]), ids)
        self.assertEqual(18, sum(len(s["portas"]) for s in self.res["subareas"]))
        hall = area(self.res, "hall")["doc"]["objetos"][0]
        self.assertEqual("porta", hall["trancadaAte"])

    def test_pl4_sala_11x10_e_caixas_na_tela(self):
        sala = area(self.res, "sala")
        self.assertEqual((11, 10), (sala["largura"], sala["altura"]))
        for s in self.res["subareas"]:
            self.assertLessEqual(s["largura"], 15)
            self.assertLessEqual(s["altura"], 11)

    def test_invariantes_das_paredes(self):
        for s in self.res["subareas"]:
            self.assertEqual([], invariantes(s["doc"]), s["id"])

    def test_cozinha_tem_passagem_de_dois_tiles(self):
        # Diretor, playtest da 1.1.0 (2026-11-18): passagem Cozinha/Lavanderia de 1 para 2 tiles (colunas 3 e 4, entre as linhas 2 e 3)
        cozinha = area(self.res, "cozinha")["doc"]
        self.assertEqual(1, len(c.conexidade(cozinha)))
        self.assertEqual(4, area(self.res, "cozinha")["contagens"]["arestasInternas"])
        for x in (3, 4):
            self.assertEqual(0, mascara(self.res, "cozinha", x, 2) & BIT["baixo"])
        for x in (0, 1, 2, 5):
            self.assertEqual(BIT["baixo"], mascara(self.res, "cozinha", x, 2) & BIT["baixo"])

    def test_verificar_passa_e_bytes_iguais(self):
        self.assertEqual(0, c.main(["--girar", "--verificar"]))
        outra = c.converter(REAL, c.carregar_perfil("hd-480x352"), c.Coletor("x"), True)
        self.assertEqual([s["texto"] for s in self.res["subareas"]], [s["texto"] for s in outra["subareas"]])
        self.assertEqual(c.texto_do_resumo(self.res), c.texto_do_resumo(outra))

    def test_sem_giro_a_sala_pede_a_barra(self):
        col = c.Coletor("x")
        res = c.converter(REAL, c.carregar_perfil("hd-480x352"), col, False)
        self.assertIsNone(res)
        self.assertIn("E018", codigos(col)[0])


class C2_Areas(unittest.TestCase):
    def test_diagonal_nao_une(self):
        res, col = converter_texto(construir_tmx(["a.", ".a"], [(0, 0, "x"), (1, 1, "y")]))
        self.assertEqual(["x", "y"], [s["id"] for s in res["subareas"]])
        res, col = converter_texto(construir_tmx(["a.", ".a"], [(0, 0, "x")]))
        self.assertIsNone(res)
        self.assertIn("E004", codigos(col)[0])

    def test_mesmo_gid_separado_por_outro_gid(self):
        res, col = converter_texto(construir_tmx(["aba"], [(0, 0, "x"), (1, 0, "y"), (2, 0, "z")]))
        self.assertEqual(["x", "y", "z"], [s["id"] for s in res["subareas"]])
        res, col = converter_texto(construir_tmx(["aba"], [(0, 0, "x"), (1, 0, "y")]))
        self.assertIn("E004", codigos(col)[0])

    def test_blocos_que_se_tocam_com_muro_sao_uma_area(self):
        # muro na linha de cima só: a área segue conexa pela linha de baixo
        res, col = converter_texto(construir_tmx(["aa", "aa"], [(0, 0, "x")], muros=[(30, 0, 4, 32)]))
        self.assertEqual(["x"], [s["id"] for s in res["subareas"]])
        self.assertEqual(11, mascara(res, "x", 0, 0))      # cima + esquerda + direita (muro)

    def test_dois_rotulos_na_mesma_area(self):
        res, col = converter_texto(construir_tmx(["aa"], [(0, 0, "x"), (1, 0, "y")]))
        self.assertIsNone(res)
        self.assertIn("E004", codigos(col)[0])

    def test_gids_diferentes_que_se_tocam_sao_areas_sem_vao(self):
        res, col = converter_texto(construir_tmx(["ab"], [(0, 0, "x"), (1, 0, "y")]))
        self.assertEqual(2, len(res["subareas"]))
        self.assertEqual((1, 1), (area(res, "x")["largura"], area(res, "y")["largura"]))
        self.assertIn("W035", codigos(col)[1])


class C3_MuroCobertura(unittest.TestCase):
    GRADE = ["aaa", "aaa"]

    def rodar(self, muro):
        return converter_texto(construir_tmx(self.GRADE, [(0, 0, "x")], muros=[muro]))

    def test_limiar_de_16_px(self):
        res, col = self.rodar((0, 30, 15.99, 4))
        self.assertEqual(9, mascara(res, "x", 0, 0))
        self.assertIn("W034", codigos(col)[1])
        for comprimento in (16.00, 16.01):
            res, col = self.rodar((0, 30, comprimento, 4))
            self.assertEqual(13, mascara(res, "x", 0, 0), comprimento)
            self.assertTrue(mascara(res, "x", 0, 1) & BIT["cima"])
            self.assertNotIn("W034", codigos(col)[1])

    def test_17_px_numa_celula_e_15_na_seguinte(self):
        res, col = self.rodar((15, 30, 32, 4))
        self.assertTrue(mascara(res, "x", 0, 0) & BIT["baixo"])
        self.assertFalse(mascara(res, "x", 1, 0) & BIT["baixo"])

    def test_comprimento_exato_de_um_tile(self):
        res, col = self.rodar((0, 30, 32, 4))
        self.assertTrue(mascara(res, "x", 0, 0) & BIT["baixo"])
        self.assertFalse(mascara(res, "x", 1, 0) & BIT["baixo"])

    def test_meio_tile_em_duas_celulas_bloqueia_as_duas(self):
        res, col = self.rodar((16, 30, 32, 4))
        self.assertTrue(mascara(res, "x", 0, 0) & BIT["baixo"])
        self.assertTrue(mascara(res, "x", 1, 0) & BIT["baixo"])

    def test_dois_muros_colineares_curtos_nao_se_unem(self):
        res, col = converter_texto(construir_tmx(self.GRADE, [(0, 0, "x")],
                                                 muros=[(0, 30, 10, 4), (12, 30, 10, 4)]))
        self.assertEqual(9, mascara(res, "x", 0, 0))
        self.assertEqual(2, sum(1 for a in col.avisos if a[0] == "W034"))

    def test_muro_menor_que_16_px_e_quadrado(self):
        res, col = self.rodar((10, 30, 6, 6))
        self.assertEqual(9, mascara(res, "x", 0, 0))
        self.assertIn("W034", codigos(col)[1])


class C4_MuroGrade(unittest.TestCase):
    GRADE = ["aaa", "aaa"]

    def rodar(self, muro):
        return converter_texto(construir_tmx(self.GRADE, [(0, 0, "x")], muros=[muro]))

    def test_distancia_a_grade(self):
        for d, ok in ((7.99, True), (8.00, True), (8.01, False)):
            res, col = self.rodar((0, 30 + d, 32, 4))
            self.assertEqual(ok, res is not None, d)
            if not ok:
                self.assertIn("E033", codigos(col)[0])
            else:
                self.assertTrue(mascara(res, "x", 0, 0) & BIT["baixo"], d)

    def test_distancia_para_o_outro_lado_da_grade(self):
        res, col = self.rodar((0, 30 - 8, 32, 4))
        self.assertIsNotNone(res)
        res, col = self.rodar((0, 30 - 8.01, 32, 4))
        self.assertIn("E033", codigos(col)[0])

    def test_espessura(self):
        res, col = self.rodar((0, 26, 64, 12.00))
        self.assertIsNotNone(res, col.erros)
        res, col = self.rodar((0, 26, 64, 12.01))
        self.assertIn("E033", codigos(col)[0])

    def test_muro_rotacionado(self):
        res, col = self.rodar((0, 30, 32, 4, 90))
        self.assertIn("E033", codigos(col)[0])

    def test_muro_vertical(self):
        res, col = converter_texto(construir_tmx(self.GRADE, [(0, 0, "x")], muros=[(30, 0, 4, 32)]))
        self.assertTrue(mascara(res, "x", 0, 0) & BIT["direita"])
        self.assertTrue(mascara(res, "x", 1, 0) & BIT["esquerda"])
        self.assertFalse(mascara(res, "x", 0, 1) & BIT["direita"])


class C5_MuroEFronteira(unittest.TestCase):
    def test_muro_sobre_fronteira_confirma_sem_aviso(self):
        res, col = converter_texto(construir_tmx(["ab"], [(0, 0, "x"), (1, 0, "y")], muros=[(30, 0, 4, 32)]))
        self.assertEqual([], [a for a in codigos(col)[1] if a in ("W034", "W035")])
        self.assertTrue(mascara(res, "x", 0, 0) & BIT["direita"])

    def test_fronteira_sem_muro_um_aviso_por_par(self):
        res, col = converter_texto(construir_tmx(["ab", "ab"], [(0, 0, "x"), (1, 0, "y")]))
        w035 = [a for a in col.avisos if a[0] == "W035"]
        self.assertEqual(1, len(w035))
        self.assertIn("2 aresta(s)", w035[0][1])
        self.assertTrue(mascara(res, "x", 0, 0) & BIT["direita"])         # é parede mesmo assim
        self.assertEqual(2, area(res, "x")["contagens"]["fronteirasSemMuro"])

    def test_aresta_da_porta_fica_fora_do_aviso(self):
        res, col = converter_texto(construir_tmx(["ab", "ab"], [(0, 0, "x"), (1, 0, "y")], portas=[(32, 16)]))
        w035 = [a for a in col.avisos if a[0] == "W035"]
        self.assertIn("1 aresta(s)", w035[0][1])

    def test_muro_sobre_aresta_exterior(self):
        res, col = converter_texto(construir_tmx(["a"], [(0, 0, "x")], muros=[(0, -2, 32, 4)]))
        self.assertNotIn("W034", codigos(col)[1])

    def test_muro_sobre_aresta_vazia(self):
        res, col = converter_texto(construir_tmx(["a.."], [(0, 0, "x")], muros=[(62, 0, 4, 32)]))
        self.assertIn("W034", codigos(col)[1])

    def test_muro_sobre_a_aresta_da_porta(self):
        res, col = converter_texto(construir_tmx(["ab"], [(0, 0, "x"), (1, 0, "y")],
                                                 muros=[(30, 0, 4, 32)], portas=[(31, 16)]))
        self.assertIsNone(res)
        self.assertIn("E032", codigos(col)[0])


class C6_Porta(unittest.TestCase):
    AB = ["ab"]
    ROT = [(0, 0, "x"), (1, 0, "y")]

    def porta(self, px, py=16, grade=None, rotulos=None, props=None, **kw):
        ponto = (px, py, props) if props else (px, py)
        return converter_texto(construir_tmx(grade or self.AB, rotulos or self.ROT, portas=[ponto], **kw))

    def test_tolerancia_de_12_px(self):
        res, col = self.porta(32 - 11.9)
        self.assertIsNotNone(res, col.erros)
        res, col = self.porta(32 - 12.1)
        self.assertIn("E030", codigos(col)[0])
        res, col = self.porta(32 + 11.9)
        self.assertIsNotNone(res, col.erros)
        res, col = self.porta(32 + 12.1)
        self.assertIn("E030", codigos(col)[0])

    def test_ponto_nos_dois_lados_da_mesma_aresta(self):
        res_a, _ = self.porta(30)
        res_b, _ = self.porta(34)
        for r in (res_a, res_b):
            p = next(o for o in area(r, "x")["doc"]["objetos"] if o["tipo"] == "porta")
            self.assertEqual(("x-y", 0, 0, "direita"), (p["id"], p["x"], p["y"], p["lado"]))
            q = next(o for o in area(r, "y")["doc"]["objetos"] if o["tipo"] == "porta")
            self.assertEqual(("x-y", 0, 0, "esquerda"), (q["id"], q["x"], q["y"], q["lado"]))

    def test_chegada_e_direcao(self):
        res, _ = self.porta(32)
        sp = next(o for o in area(res, "y")["doc"]["objetos"] if o["tipo"] == "spawn")
        self.assertEqual(("x-y", 0, 0, "direita"), (sp["nome"], sp["x"], sp["y"], sp["direcao"]))
        sp = next(o for o in area(res, "x")["doc"]["objetos"] if o["tipo"] == "spawn")
        self.assertEqual("esquerda", sp["direcao"])

    def test_ambigua_perto_de_um_vertice(self):
        grade = ["ab", "cd"]
        rot = [(0, 0, "x"), (1, 0, "y"), (0, 1, "z"), (1, 1, "w")]
        res, col = self.porta(30, 30, grade, rot)
        self.assertIn("E030", codigos(col)[0])
        res, col = self.porta(30, 25, grade, rot)          # 2 px contra 7 px: vence a mais próxima
        self.assertIsNotNone(res, col.erros)

    def test_piso_e_vazio_nao_e_porta(self):
        res, col = self.porta(30, 16, ["a."], [(0, 0, "x")])
        self.assertIn("E030", codigos(col)[0])

    def test_longe_de_qualquer_aresta(self):
        res, col = self.porta(16, 16)
        self.assertIn("E030", codigos(col)[0])

    def test_duas_portas_entre_o_mesmo_par(self):
        grade = ["ab", "ab"]
        res, col = converter_texto(construir_tmx(grade, self.ROT, portas=[(32, 16), (32, 48)]))
        self.assertIsNone(res)
        self.assertIn("E031", codigos(col)[0])
        res, col = converter_texto(construir_tmx(grade, self.ROT, portas=[(32, 16), (32, 48, {"id": "outra"})]))
        self.assertIsNotNone(res, col.erros)
        self.assertEqual({"x-y", "outra"}, {p["id"] for p in area(res, "x")["portas"]})

    def test_duas_portas_na_mesma_aresta(self):
        res, col = converter_texto(construir_tmx(["ab"], self.ROT, portas=[(32, 10), (32, 22, {"id": "outra"})]))
        self.assertIn("E031", codigos(col)[0])

    def test_ordem_alfabetica_com_sublinhado(self):
        res, col = converter_texto(construir_tmx(["a", "c"], [(0, 0, "quarto_casal"), (0, 1, "quarto")],
                                                 portas=[(16, 32)]))
        self.assertEqual("quarto-quarto_casal", area(res, "quarto")["portas"][0]["id"])
        grade = ["bb", "ac"]
        rot = [(0, 0, "banheiro1"), (0, 1, "quarto"), (1, 1, "quarto_casal")]
        res, col = converter_texto(construir_tmx(grade, rot, portas=[(16, 32), (48, 32)]))
        self.assertEqual({"banheiro1-quarto", "banheiro1-quarto_casal"},
                         {p["id"] for p in area(res, "banheiro1")["portas"]})

    def test_trancada_ate_vale_nos_dois_lados(self):
        res, col = self.porta(32, props={"trancadaAte": "porta"})
        for ident in ("x", "y"):
            p = next(o for o in area(res, ident)["doc"]["objetos"] if o["tipo"] == "porta")
            self.assertEqual("porta", p["trancadaAte"])

    def test_porta_com_tile_bloqueado(self):
        res, col = self.porta(32, bloq=[(0, 0, 32, 32)])
        self.assertIn("E009", codigos(col)[0])

    def test_propriedade_desconhecida(self):
        res, col = self.porta(32, props={"cor": "azul"})
        self.assertIn("E014", codigos(col)[0])


class C7_Conexidade(unittest.TestCase):
    def test_muros_que_isolam_parte_da_area(self):
        res, col = converter_texto(construir_tmx(["aaa", "aaa"], [(0, 0, "x")], muros=[(30, 0, 4, 64)]))
        self.assertIsNone(res)
        self.assertIn("E036", codigos(col)[0])

    def test_um_tile_de_passagem_passa(self):
        res, col = converter_texto(construir_tmx(["aaa", "aaa"], [(0, 0, "x")], muros=[(30, 0, 4, 32)]))
        self.assertIsNotNone(res, col.erros)


class C8_Giro(unittest.TestCase):
    def test_mascara_quatro_giros(self):
        for m in range(16):
            r = m
            for _ in range(4):
                r = c.girar_mascara(r)
            self.assertEqual(m, r)
        self.assertEqual(BIT["direita"], c.girar_mascara(BIT["cima"]))
        self.assertEqual(BIT["cima"], c.girar_mascara(BIT["esquerda"]))

    def doc(self):
        objs = [{"tipo": "porta", "id": "a-b", "x": 1, "y": 0, "lado": "cima", "destino": "b", "spawnDestino": "a-b"},
                {"tipo": "spawn", "nome": "a-b", "x": 1, "y": 0, "direcao": "baixo"},
                {"tipo": "movel", "id": "m", "nome": "M", "x": 0, "y": 1, "w": 2, "h": 1}]
        return {"altura": 2, "chao": [1, 2, 3, 4, 5, 6], "colisao": [0, 0, 0, 0, 0, 1], "escuro": False,
                "id": "t", "largura": 3, "objetos": c.ordenar_objetos(objs),
                "paredes": [9, 1, 3, 12, 4, 6], "schemaVersion": 3, "tile": 32}

    def test_giro_de_area(self):
        g = c.girar_area(self.doc())
        self.assertEqual((2, 3), (g["largura"], g["altura"]))
        self.assertEqual([4, 1, 5, 2, 6, 3], g["chao"])
        porta = next(o for o in g["objetos"] if o["tipo"] == "porta")
        self.assertEqual((1, 1, "direita"), (porta["x"], porta["y"], porta["lado"]))      # (altura-1-y, x)
        spawn = next(o for o in g["objetos"] if o["tipo"] == "spawn")
        self.assertEqual("esquerda", spawn["direcao"])
        movel = next(o for o in g["objetos"] if o["tipo"] == "movel")
        self.assertEqual((0, 0, 1, 2), (movel["x"], movel["y"], movel["w"], movel["h"]))
        self.assertEqual(c.girar_mascara(9), g["paredes"][1])         # tile (0,0) vai para (1,0)

    def test_quatro_giros_devolvem_o_documento(self):
        d = self.doc()
        r = d
        for _ in range(4):
            r = c.girar_area(r)
        self.assertEqual(d, r)

    def test_saida_girada_igual_ao_giro_da_saida(self):
        tmx = construir_tmx(["aaa", "aaa"], [(0, 0, "x")], muros=[(30, 0, 4, 32)])
        plano, _ = converter_texto(tmx, girar=False)
        girado, _ = converter_texto(tmx, girar=True)
        self.assertEqual(c.girar_area(area(plano, "x")["doc"]), area(girado, "x")["doc"])

    def test_linha_da_barra_depois_do_giro(self):
        tmx = construir_tmx(["a"] * 11, [(0, 0, "x")])
        res, col = converter_texto(tmx, girar=False)
        self.assertIsNone(res)
        self.assertIn("E018", codigos(col)[0])
        res, col = converter_texto(tmx, girar=True)
        self.assertIsNotNone(res, col.erros)
        self.assertEqual((11, 1), (area(res, "x")["largura"], area(res, "x")["altura"]))

    def test_caixa_maior_que_a_tela(self):
        res, col = converter_texto(construir_tmx(["a" * 16], [(0, 0, "x")]))
        self.assertIn("E006", codigos(col)[0])
        res, col = converter_texto(construir_tmx(["a" * 16], [(0, 0, "x")]), girar=True)
        self.assertIn("E006", codigos(col)[0])

    def test_deslocamento_e_origem_girados(self):
        res, _ = converter_texto(construir_tmx(["aaa", "aaa"], [(0, 0, "x")]), girar=True)
        self.assertEqual([-2, 0], area(res, "x")["deslocamento"])
        self.assertEqual([-2, 0], res["origemDaCasa"])


class C9_Bilhete(unittest.TestCase):
    def bilhete(self, tx, lado, grade=("aa",), portas=(), rotulos=((0, 0, "x"),)):
        props = {"texto": "bilhete.pista"}
        if lado:
            props["lado"] = lado
        return converter_texto(construir_tmx(list(grade), list(rotulos), portas=list(portas),
                                             jogo=[{"classe": "bilhete", "tx": tx, "ty": 0, "props": props}]))

    def test_lado_sem_parede(self):
        res, col = self.bilhete(0, "direita")
        self.assertIn("E037", codigos(col)[0])

    def test_lado_com_parede(self):
        res, col = self.bilhete(0, "esquerda")
        self.assertNotIn("E037", codigos(col)[0])
        self.assertNotIn("E014", codigos(col)[0])

    def test_lado_com_porta(self):
        res, col = self.bilhete(0, "direita", grade=("ab",), portas=[(32, 16)], rotulos=[(0, 0, "x"), (1, 0, "y")])
        self.assertIn("E037", codigos(col)[0])

    def test_sem_lado(self):
        res, col = self.bilhete(0, None)
        self.assertIn("E014", codigos(col)[0])

    def test_tile_bloqueado(self):
        res, col = converter_texto(construir_tmx(["aa"], [(0, 0, "x")], bloq=[(0, 0, 32, 32)],
                                                 jogo=[{"classe": "bilhete", "tx": 0, "ty": 0,
                                                        "props": {"texto": "t", "lado": "esquerda"}}]))
        self.assertIn("E037", codigos(col)[0])


class ObjetosDeJogo(unittest.TestCase):
    def test_conjunto_completo_passa(self):
        grade = ["aaaaa", "aaaaa", "aaaaa"]
        jogo = [
            {"classe": "peca", "tx": 0, "ty": 0, "texto": "1", "props": {"estadoInicial": "visivel"}},
            {"classe": "peca", "tx": 4, "ty": 0, "texto": "2", "props": {"estadoInicial": "escondida"}},
            {"classe": "peca", "tx": 4, "ty": 2, "texto": "3", "props": {"estadoInicial": "escondida"}},
            {"classe": "enfeite", "tx": 2, "ty": 1},
            {"classe": "interruptor", "tx": 2, "ty": 2},
            {"classe": "arvore", "tx": 1, "ty": 1, "props": {"estado": "desmontada"}},
            {"classe": "spawn", "tx": 0, "ty": 2, "nome": "elevador", "props": {"direcao": "cima"}},
        ]
        res, col = converter_texto(construir_tmx(grade, [(0, 0, "x")], jogo=jogo))
        self.assertIsNotNone(res, col.erros)
        contagem = area(res, "x")["contagens"]["objetos"]
        self.assertEqual({"arvore": 1, "enfeite": 1, "interruptor": 1, "peca": 3, "spawn": 1}, contagem)
        self.assertEqual(1, area(res, "x")["contagens"]["bloqueadosComPiso"])        # a árvore

    def test_sem_objetos_de_jogo_so_avisa(self):
        res, col = converter_texto(construir_tmx(["aa"], [(0, 0, "x")]))
        self.assertIsNotNone(res)
        self.assertIn("W038", codigos(col)[1])

    def test_pecas_ausentes_com_objetos_de_jogo(self):
        res, col = converter_texto(construir_tmx(["aa"], [(0, 0, "x")],
                                                 jogo=[{"classe": "interruptor", "tx": 0, "ty": 0}]))
        self.assertIn("E021", codigos(col)[0])
        self.assertIn("E029", codigos(col)[0])

    def test_peca_atras_de_muro_sem_vizinho_alcancavel(self):
        # a peça 1 só tem um vizinho, e o muro fecha a aresta
        grade = ["aaa", "aaa"]
        jogo = [{"classe": "peca", "tx": 0, "ty": 0, "texto": "1", "props": {"estadoInicial": "visivel"}}]
        muros = [(0, 30, 32, 4), (30, 0, 4, 32)]
        res, col = converter_texto(construir_tmx(grade, [(0, 0, "x")], muros=muros, jogo=jogo))
        self.assertIn("E010", codigos(col)[0])


class C10_GoldenTxt(unittest.TestCase):
    def test_grade_dupla_da_planta_minima(self):
        col = c.Coletor("mini.tmx")
        res = c.converter(DADOS / "mini.tmx", c.carregar_perfil("hd-480x352"), col, False)
        self.assertIsNotNone(res, col.erros)
        for ident in ("aa", "bb"):
            esperado = (DADOS / f"{ident}.txt").read_text(encoding="utf-8")
            self.assertEqual(esperado, "\n".join(area(res, ident)["grade"]) + "\n", ident)
        self.assertEqual(1, sum(1 for a in col.avisos if a[0] == "W035"))

    def test_dimensoes_da_grade(self):
        res, _ = converter_texto(construir_tmx(["aaa", "aaa"], [(0, 0, "x")]))
        grade = area(res, "x")["grade"]
        self.assertEqual(5, len(grade))
        self.assertEqual("+-+-+-+", grade[0])


if __name__ == "__main__":
    unittest.main()
