import api from "./api";

export interface Viagem {
  tipo: TipoViagem;
  id: number;
  title: string;
  clientName: string;
  telefone: string;
  valor: number;
  startLocation: string;
  endLocation: string;
  veiculoId: number;
  veiculoInfo: string;
  motoristaId: number;
  motoristaNome: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  status: string;
}

export enum TipoViagem {
  FRETAMENTO_AEROPORTO = "FRETAMENTO_AEROPORTO",
  IDA_E_VOLTA_MG = "IDA_E_VOLTA_MG",
  SOMENTE_IDA_MG = "SOMENTE_IDA_MG",
  IDA_E_VOLTA_FORA_MG = "IDA_E_VOLTA_FORA_MG",
  SOMENTE_IDA_FORA_MG = "SOMENTE_IDA_FORA_MG",
  ROTA_COLABORADORES = "ROTA_COLABORADORES",
}

export interface CadastroViagemData {
  title: string;
  clientName: string;
  telefone: string;
  valor: number;
  startLocation: string;
  endLocation: string;
  veiculoId: number;
  motoristaId: number;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  tipo: TipoViagem;
}

export type UpdateViagemData = Partial<CadastroViagemData>;

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
