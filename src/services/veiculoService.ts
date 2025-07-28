import api from "./api";

export interface Vehicle {
  id: number;
  model: string;
  plate: string;
  ano: string;
  color: string;
  renavam: string;
  status: string;
  currentKm: number;
}

export type CadastroVehicleData = Omit<Vehicle, "id" | "status" | "currentKm">;

export type UpdateVehicleData = Partial<Omit<Vehicle, "id" | "plate">>;

const ROTA = "/veiculos";

export const veiculoService = {
  async listar(): Promise<Vehicle[]> {
    const res = await api.get<Vehicle[]>(ROTA);
    return res.data;
  },

  async adicionar(dados: CadastroVehicleData): Promise<Vehicle> {
    const res = await api.post<Vehicle>(ROTA, dados);
    return res.data;
  },

  async editar(id: number, dados: UpdateVehicleData): Promise<Vehicle> {
    const res = await api.put<Vehicle>(`${ROTA}/${id}`, dados);
    return res.data;
  },

  async excluir(id: number): Promise<void> {
    await api.delete(`${ROTA}/${id}`);
  },
};
