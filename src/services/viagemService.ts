import api from "./api";

export type TipoViagemEnum =
  | "FRETAMENTO_AEROPORTO"
  | "IDA_E_VOLTA_MG"
  | "SOMENTE_IDA_MG"
  | "IDA_E_VOLTA_FORA_MG"
  | "SOMENTE_IDA_FORA_MG"
  | "ROTA_COLABORADORES";

// Reutilizando ItemRota, mas para envio, alguns campos como info/nome não são necessários
// E o id pode ser opcional para atualização, mas para criação de novos itens é undefined
export interface ItemRotaParaEnvio {
  id?: number; // Pode vir se for um item existente sendo atualizado (mas para novos, será undefined)
  veiculoId: number;
  motoristaId: number;
  horarioInicio: string; // "HH:MM"
  horarioFim: string; // "HH:MM"
}

// Interface para os dados de cada Item da Rota (vindos do backend)
export interface ItemRota {
  id?: number; // Pode vir com ID se for um item existente
  veiculoId: number;
  veiculoInfo: string; // Ex: "Modelo (Placa)"
  motoristaId: number;
  motoristaNome: string; // Ex: "Nome do Motorista"
  horarioInicio: string; // "HH:MM"
  horarioFim: string; // "HH:MM"
}

// Interface para os dados de Viagem retornados pelo backend (DadosDetalhamentoViagem)
export interface Viagem {
  id: number;
  title: string;
  clientName: string;
  telefone: string;
  valor: number;
  startLocation: string;
  endLocation: string;
  veiculoId?: number; // Tornar opcional, pois para ROTA_COLABORADORES pode ser nulo
  veiculoInfo?: string; // Tornar opcional
  motoristaId?: number; // Tornar opcional
  motoristaNome?: string; // Tornar opcional
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  status: "AGENDADA" | "EM_CURSO" | "FINALIZADA" | "CANCELADA";
  tipoViagem: TipoViagemEnum;
  itensRota: ItemRota[];
}

// Interface para os dados de Cadastro de Viagem enviados ao backend (DadosCadastroViagem)
// O status é obrigatório no cadastro, como definido no backend.
export interface CadastroViagemData {
  title: string;
  clientName: string;
  telefone: string;
  valor: number;
  startLocation: string;
  endLocation: string;
  veiculoId?: number; // Tornar opcional, pois para ROTA_COLABORADORES é nulo
  motoristaId?: number; // Tornar opcional
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  status: "AGENDADA" | "EM_CURSO" | "FINALIZADA" | "CANCELADA";
  tipoViagem: TipoViagemEnum;
  // ADICIONE ESTA PROPRIEDADE:
  itensRota?: ItemRotaParaEnvio[]; // Torne opcional, pois só é preenchida para ROTA_COLABORADORES
}

// Interface para os dados de Atualização de Viagem enviados ao backend (DadosAtualizacaoViagem)
// Todos os campos são opcionais, exceto o ID da viagem a ser atualizada
export interface UpdateViagemData
  extends Partial<Omit<CadastroViagemData, "itensRota">> {
  itensRota?: ItemRotaParaEnvio[]; // Inclua a lista de itens da rota para atualização
}

const ROTA = "/viagens";

export const viagemService = {
  async listar(): Promise<Viagem[]> {
    const res = await api.get<Viagem[]>(ROTA);
    return res.data;
  },

  async adicionar(dados: CadastroViagemData): Promise<Viagem> {
    const res = await api.post<Viagem>(ROTA, dados, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  },

  async editar(id: number, dados: UpdateViagemData): Promise<Viagem> {
    const res = await api.put<Viagem>(`${ROTA}/${id}`, dados, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  },

  async excluir(id: number): Promise<void> {
    await api.delete(`${ROTA}/${id}`);
  },
};
