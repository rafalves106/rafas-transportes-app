import api from "./api";
import { AxiosError } from "axios";

export interface BackendErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path?: string;
}

export interface Vehicle {
  id: number;
  model: string;
  plate: string;
  status: string;
  currentKm: number;
}

export type CadastroVehicleData = Omit<Vehicle, "id">;

export type UpdateVehicleData = Partial<Omit<Vehicle, "id" | "plate">>;

const ROTA = "/veiculos";

export const veiculoService = {
  async listar(): Promise<Vehicle[]> {
    const res = await api.get<Vehicle[]>(ROTA);
    return res.data;
  },

  async adicionar(dados: CadastroVehicleData): Promise<void> {
    try {
      await api.post<Vehicle>(ROTA, dados);
    } catch (error) {
      throw error as AxiosError<BackendErrorResponse>;
    }
  },

  async editar(id: number, dados: UpdateVehicleData): Promise<void> {
    try {
      await api.put<Vehicle>(`${ROTA}/${id}`, dados);
    } catch (error) {
      throw error as AxiosError<BackendErrorResponse>; // Tipa o erro
    }
  },

  async excluir(id: number): Promise<void> {
    try {
      await api.delete(`${ROTA}/${id}`);
    } catch (error) {
      throw error as AxiosError<BackendErrorResponse>;
    }
  },
};
