# Style Guide

> Dono: agente Especialista. Derivado do GDD (seções 7 e 9). Mudou o GDD, atualize aqui.

## Arte
- Pixel art, resolução base **240×160**, escala em número inteiro
- Tiles **16×16 px**
- Paleta **16 a 32 cores**: vermelho, verde e dourado de Natal + neutros para a casa
- Câmera fixa por cômodo (sem rolagem na v1)
- Sem copiar personagens, sprites ou elementos da Nintendo/Game Freak
- Os 4 Sobrinhos: mesmo tamanho e mesma estrutura de animação (andar ×4 direções, parado, interagindo, comemorando)
- Nick: dormindo, acordado, farejando, feliz
- Árvore: 4 estados (desmontada, 1 parte, 2 partes, completa)
- Nomes de arquivo: `tipo_nome_variacao.png` (ex.: `spr_lolo_walk_down.png`, `spr_nick_sleep.png`)

## UI e texto
- Português brasileiro, frases curtas (uma criança de 5 anos acompanha; adultos não acham infantil)
- Fonte grande e legível, bom contraste
- Diálogos avançam com A, sem tempo automático
- Alvo de toque mínimo: 44×44 px
- Só modo paisagem no celular; retrato mostra aviso de rotação

## Código
- Phaser 3 + TypeScript, Vite, Vitest (testes na camada de domínio)
- Clean Architecture + DDD (ver `docs/ADR-001.md`, a criar)
- Domínio sem dependência de Phaser; cenas só orquestram
- Personagem escolhido = identificador; sprite por id, sem duplicar lógica
- Mapas: Tiled exportado em JSON, em `maps/`
- Persistência: `localStorage` (checkpoint + sobrinho escolhido), com campo `saveVersion` e migrações; sempre em try/catch
- Conteúdo em `content/` (mapas, missões, textos) + `content/manifest.json`; o motor lê o manifesto, não conhece mapas pelo nome
- Versão do jogo vem do `package.json` e aparece na tela de título
- Build de playtest: arquivo HTML único (`npm run build:playtest`)
- Sem rastreamento nem serviço de terceiros

## Pastas
`src/` · `assets/` · `maps/` · `content/` · `qa/` · `docs/`

## Áudio
- Só faixas de domínio público ou licença gratuita; registrar origem em `docs/audio-licencas.md`
- Tudo silenciável no menu
