/**
 * Perfil de arte (ADR-003): os parâmetros visuais que o motor lê e que a arte da build obedece.
 * Mora em `content/art-profiles/<id>.json` e é referenciado por `content/manifest.json` (`artProfile`).
 * Só dados: nenhum número de arte fica no código; as cenas leem daqui.
 */
export const PERFIL_PADRAO_ID = 'gba-240x160';
/** Maior schemaVersion do perfil que este motor entende (o arquivo do perfil tem versão própria). */
export const SCHEMA_PERFIL_SUPORTADO = 1;
/** Tipos de luz que a apresentação sabe desenhar (ADR-003 seção 7). */
export const TIPOS_DE_LUZ = ['penumbra-degraus'] as const;

export type TipoDeLuz = (typeof TIPOS_DE_LUZ)[number];

export interface Dimensao {
  w: number;
  h: number;
}

export interface CorpoDePersonagem {
  quadro: Dimensao;
  pes: Dimensao;
  quadrosDeAndar: number;
  fpsAndar: number;
}

/** Corpo do Nick (ADR-005 seção 7.1; ADR-003 "corpos"). O quadro e a caixa dos pés vêm do perfil. */
export interface CorpoDoNick {
  quadro: Dimensao;
  /** Caixa dos pés, quando a Arte declara (ADR-003). Sem ela, o Nick se alinha à base do tile. */
  pes?: Dimensao;
  quadrosDeAndar: number;
}

export interface PerfilDeArte {
  schemaVersion: number;
  id: string;
  nome: string;
  /** Lado do tile em px. Mapas, colisão e spawns são autorados em tiles. */
  tile: number;
  sala: { colunas: number; linhas: number };
  /** `inteira`: fator inteiro ≥ minima (v1). `hibrida`: inteiro a partir de inteiraAPartirDe, fracionário abaixo (ADR-003 seção 9). */
  escala: { minima: number; modo: 'inteira' | 'hibrida'; inteiraAPartirDe?: number };
  paleta: { minimoDeCores: number; maximoDeCores: number };
  /** Cores mínimas por sprite de sobrinho (spr_<id>_*). Sprite com menos cores é erro no validar:perfil. */
  sprites: { sobrinho: { coresMin: number }; nick?: { coresMin: number } };
  fonte: { familia: string; grade: number; corpo: number; titulo: number; entrelinhas: number; entrelinhasFina: number };
  espaco: { pequeno: number; medio: number; grande: number };
  tema: { fundo: string; texto: string; destaque: string; fraco: string; caixa: string; alfaCaixa: number; alfaBarra: number };
  barra: { margemLateral: number; margemInferior: number; entreLinhas: number; alturaPorLinhas: Record<'1' | '2', number> };
  botao: {
    largura: number;
    altura: number;
    recuoMarca: number;
    bordaNormal: number;
    bordaFoco: number;
    bordaPressionada: number;
    bordaFocoTecla: number;
    larguraTecla: number;
    alturaTecla: number;
  };
  dialogo: { altura: number; borda: number; seta: { largura: number; altura: number; deTopo: number; recuo: number } };
  /** `tons`: quantos tons nas bordas dos degraus (1 no v1; 3 a 4 no HD, ADR-003 seção 7). */
  luz: { tipo: TipoDeLuz; raioEmTiles: number; passoDegrau: number; alfa: number; tons?: number };
  objetos: { brilhoInterruptor: { raioEmTiles: number; alfa: number }; halo: { margem: number } };
  escalaDeExibicao: { cartao: number; conquista: number };
  corpos: { sobrinho: CorpoDePersonagem; nick?: CorpoDoNick };
  telas: {
    titulo: { nomeY: number; versaoTopo: number; menuY: [number, number] };
    comoJogar: { tituloY: number; listaX: number; listaY: number; listaLargura: number; espacoEntreItens: number; voltarY: number };
    selecao: {
      tituloY: number;
      tituloLargura: number;
      cartaoLargura: number;
      cartaoAltura: number;
      cartaoTopo: number;
      espaco: number;
      spriteDeTopo: number;
      nomeDeTopo: number;
    };
    conquista: {
      personagem: { x: number; y: number };
      lampada: { x: number; y: number };
      /** Tela de conquista de peça (GDD 15.5): ilustração à esquerda e sobrinho à direita (96×96 no HD). */
      peca: { x: number; y: number; escala: number };
      personagemDaPeca: { x: number; y: number };
      textoY: number;
      textoLargura: number;
      continuarY: number;
    };
    /**
     * Tela de créditos (GDD 17.7; ADR-006 seção 7): posições em px. Sem rolagem: cabe em 480×352 com a barra de 1 linha.
     * O HD tem o bloco; perfis antigos (gba) não usam a tela.
     */
    creditos: {
      tituloX: number;
      tituloY: number;
      versaoTopo: number;
      nomeY: number;
      larguraTexto: number;
      sobrinhoX: number;
      sobrinhoY: number;
      sobrinhoTextoX: number;
      sobrinhoTextoLargura: number;
      arvoreX: number;
      arvoreY: number;
      nickX: number;
      nickY: number;
      nickTextoLargura: number;
      agradecimentoY: number;
      voltarY: number;
    };
  };
  painel: {
    margemTopo: number;
    campos: { passo: number; largura: number; altura: number; topo: number; textoDeTopo: number };
    mensagem: { x: number; y: number; largura: number };
    grade: { colunas: number; passoX: number; passoY: number; topo: number };
  };
  /** Pasta dos PNG do perfil, relativa à raiz do repositório (ADR-003 seção 3). */
  pasta: string;
}
