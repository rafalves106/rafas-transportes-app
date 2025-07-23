import api from "./api";
import type { Driver } from "./motoristaService";
import type { Vehicle } from "./veiculoService";

export type TipoViagemEnum =
  | "FRETAMENTO_AEROPORTO"
  | "IDA_E_VOLTA_MG"
  | "SOMENTE_IDA_MG"
  | "IDA_E_VOLTA_FORA_MG"
  | "SOMENTE_IDA_FORA_MG"
  | "ROTA_COLABORADORES";

export interface HorarioItemRota {
  dataInicio: string; // "YYYY-MM-DD"
  inicio: string; // "HH:MM"
  dataFim: string; // "YYYY-MM-DD"
  fim: string; // "HH:MM"
}

// Interface para os dados de cada Item da Rota (vindos do backend)
export interface ItemRota {
  id?: number;
  veiculoId: number;
  motoristaId: number;
  veiculo?: Vehicle;
  motorista?: Driver;
  horarios: HorarioItemRota[]; // Agora é uma lista de HorarioItemRota
}

// Reutilizando ItemRota, mas para envio, alguns campos como info/nome não são necessários
// E o id pode ser opcional para atualização, mas para criação de novos itens é undefined
export interface ItemRotaParaEnvio {
  id?: number;
  veiculoId: number;
  motoristaId: number;
  horarios: HorarioItemRota[]; // Para envio também será uma lista
}

// Interface para os dados de Viagem retornados pelo backend (DadosDetalhamentoViagem)
export interface Viagem {
  id: number;
  title: string;
  clientName?: string;
  telefone?: string;
  valor?: number;
  tipoViagem: TipoViagemEnum;
  startDate?: string;
  startTime?: string;
  startLocation?: string;
  endDate?: string;
  endTime?: string;
  endLocation?: string;
  status: "AGENDADA" | "EM_CURSO" | "FINALIZADA" | "CANCELADA";

  veiculoId?: number;
  veiculoInfo?: string;
  motoristaId?: number;
  motoristaNome?: string;

  veiculo?: Vehicle;
  motorista?: Driver;
  itensRota?: ItemRota[]; // Lista de itens da rota (ItemRota tem horários diretos)
}

// Interface para os dados de Cadastro de Viagem enviados ao backend (DadosCadastroViagem)
// O status é obrigatório no cadastro, como definido no backend.
export interface CadastroViagemData {
  title: string;
  clientName?: string;
  telefone?: string;
  valor?: number;
  tipoViagem: TipoViagemEnum;
  startDate?: string;
  startTime?: string;
  startLocation?: string;
  endDate?: string;
  endTime?: string;
  endLocation?: string;
  status: "AGENDADA" | "EM_CURSO" | "FINALIZADA" | "CANCELADA";
  veiculoId?: number;
  motoristaId?: number;
  itensRota?: ItemRotaParaEnvio[]; // Use a interface de envio aqui
}

export interface UpdateViagemData {
  title?: string;
  clientName?: string;
  telefone?: string;
  valor?: number;
  tipoViagem?: TipoViagemEnum;
  startDate?: string;
  startTime?: string;
  startLocation?: string;
  endDate?: string;
  endTime?: string;
  endLocation?: string;
  status?: "AGENDADA" | "EM_CURSO" | "FINALIZADA" | "CANCELADA";
  veiculoId?: number;
  motoristaId?: number;
  itensRota?: ItemRotaParaEnvio[]; // Use a interface de envio aqui
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
