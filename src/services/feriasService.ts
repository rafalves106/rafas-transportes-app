import api from "./api";
import type { Driver } from "./motoristaService";

export interface CadastroFeriasData {
  motoristaId: number;
  dataInicio: string;
  dataFim: string;
}

export interface Ferias {
  id: number;
  motorista: Driver;
  dataInicio: string;
  dataFim: string;
}

export const feriasService = {
  cadastrar: async (data: CadastroFeriasData): Promise<Ferias> => {
    const response = await api.post<Ferias>("/ferias", data);
    return response.data;
  },

  listarPorMotoristaId: async (motoristaId: number): Promise<Ferias[]> => {
    const response = await api.get<Ferias[]>(
      `/ferias/motorista/${motoristaId}`
    );
    return response.data;
  },
};
