export interface Processo {
  protocolo: string;
  data_cadastro: string;
  motivo: string;
  tipo: string;
  situacao_sga: string;
  associado: string;
  placa: string;
  nome_terceiro: string;
  placa_terceiro: string;
  situacao_evento: string;
  abertura_processo: string;
  data_limite_autorizacao: string;
  data_autorizacao_reparos: string;
  data_entrega: string;
  dias_reparos: string;
  data_descricao: string;
  valor_reparo: string;
  valor_fipe: string;
  custo_evento: string;
  previsao_valor_reparo: string;
  nome_fornecedor: string;
  dias_aberto: string;
  criticidade: string;
  parecer_coordenacao: string;
}

export interface TopAntigo {
  protocolo: string;
  associado: string;
  dias_aberto: number;
  criticidade: string;
  situacao_sga: string;
}

export interface TopFornecedor {
  nome: string;
  quantidade: number;
}

export interface Analysis {
  total_processos: number;
  criticidade: {
    "Crítico": number;
    "Atenção": number;
    "Dentro do Prazo": number;
    "Sem Classificação": number;
  };
  situacao_sga: Record<string, number>;
  situacao_evento: Record<string, number>;
  tipo: Record<string, number>;
  motivo: Record<string, number>;
  fornecedores: Record<string, number>;
  processos_por_mes: Record<string, number>;
  top_mais_antigos: TopAntigo[];
  top_fornecedores: TopFornecedor[];
  valores: {
    total_valor_reparo: number;
    total_custo_evento: number;
    total_previsao: number;
  };
}

export interface ProcessoData {
  metadata: {
    ultima_atualizacao: string;
    total_processos: number;
    fonte: string;
    planilha_id: string;
  };
  analysis: Analysis;
  processos: Processo[];
}
