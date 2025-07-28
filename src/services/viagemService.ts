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
  dataInicio: string;
  inicio: string;
  dataFim: string;
  fim: string;
}

export interface ItemRota {
  id?: number;
  veiculoId: number;
  motoristaId: number;
  veiculo?: Vehicle;
  motorista?: Driver;
  horarios: HorarioItemRota[];
}

export interface ItemRotaParaEnvio {
  id?: number;
  veiculoId: number;
  motoristaId: number;
  horarios: HorarioItemRota[];
}

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
  itensRota?: ItemRota[];
}

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
  itensRota?: ItemRotaParaEnvio[];
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
  itensRota?: ItemRotaParaEnvio[];
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
