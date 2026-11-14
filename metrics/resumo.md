# Resumo final do projeto (métricas)

> Dono: Orquestrador. Fonte: `metrics/interacoes.md` (449 linhas, I-001 a I-398). Escrito em 2026-11-12, na candidata à release 1.0.0. Regras em `CLAUDE.md` (seção Métricas). Não há custo em dinheiro (decisão do Diretor, 2026-11-08: plano Pro).

## Como ler os números

- **Interações e delegações** são contagens de linhas do log: confiáveis.
- **Tokens** são a soma dos valores informados pelos resumos de uso dos agentes. Parte dessas linhas traz o total acumulado do agente (o log marca isso na nota) e parte traz a diferença por rodada; por isso a soma é uma **aproximação** e tende a contar a mais nas fases iniciais. A divisão por tipo de token (entrada, saída, cache) não é informada pela fonte e não foi estimada.
- **Tempo** é a soma das durações informadas pelos agentes; agentes rodaram em paralelo em vários momentos, então a soma é maior que o tempo de relógio.
- As conversas com o Diretor e o consumo da própria sessão do Orquestrador não têm tokens por mensagem (ver "Uso da sessão").

## Tempo corrido

- Início: 2026-11-07 (I-001, Marco 1). Fim desta contagem: 2026-11-12 (release candidata 1.0.0). Cerca de **5 dias corridos**.
- Soma do tempo informado pelos agentes: **76.952 s (cerca de 21 h 22 min)** de trabalho de agentes.

## Interações com o Diretor

- **102 mensagens do Diretor** registradas (cada uma com a resposta do Orquestrador).
- Por marco: M1 43 (M1 a M1.5), M2 11, M3 9, M4 5, M5 9, M6 19, M7 6.

## Delegações por agente (Orquestrador chamando um agente)

| Agente | Delegações |
|---|---|
| Desenvolvedor | 86 |
| QA | 71 |
| Produto | 45 |
| Arte / Level Design | 34 |
| Especialista | 31 |
| Generalista | 6 |
| Chamadas combinadas (Produto e Arte, Arte e Dev, Dev e Generalista) | 3 |
| **Total** | **275** |

## Tokens por marco (soma aproximada dos agentes)

| Marco | Tokens |
|---|---|
| M1 (inclui M1.1 a M1.5) | 5.232.776 |
| M2 | 3.994.922 |
| M3 | 6.193.445 |
| M4 | 1.936.542 |
| M5 | 2.957.123 |
| M6 | 2.778.434 |
| M7 | 501.674 |
| **Total aproximado** | **23.594.916** |

Por agente (soma aproximada, incluindo as linhas de retorno dos agentes ao Orquestrador): Desenvolvedor 7,58 M; QA 3,95 M; Produto 3,22 M; Especialista 2,57 M; Arte/Level Design 2,67 M; Generalista 0,15 M; linhas de retorno sem agente identificado 3,45 M. Todos os agentes rodaram em Haiku 5.5 (Especialista em esforço Alto; os demais em Médio), exceto o início do Marco 1, que herdou o modelo da sessão.

## Uso da sessão do Orquestrador (get_usage, 2026-11-12)

- Plano Pro, sem custo em dinheiro (extra usage desligado).
- Limite de 5 h: 20% usado; limite semanal (todos os modelos): 98% usado (reinicia em cerca de 16 h).
- Contexto desta sessão: cerca de 496 mil de 1 milhão de tokens (mensagens 436 mil; ferramentas, prompt, skills e memória o restante). A sessão foi compactada ao longo do projeto, então esse número cobre só a janela atual.

## Marcos entregues

M1 (casa, porta e luzes), M2 (peças e árvore), M3 (Nick, farejar e dicas), M4 (enfeites, créditos e plot twist), M5 (toque, joystick e aviso de rotação), M6 (áudio, pausa, polimento e release), M7 (imagens de título e fim, modo Explorar a casa e carga externa). Playtests PT1 a PT5 aprovados pelo Diretor. Testes automáticos ao final: 971 de 971.
