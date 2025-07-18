import api from "./api";

export interface Maintenance {
  id: number;
  veiculoId: number;
  veiculoDescricao: string;
  title: string;
  type: "Preventiva" | "Corretiva";
  date: string;
  cost: number;
  status: "Agendada" | "Realizada";
}

export type CreateMaintenanceData = Omit<
  Maintenance,
  "id" | "veiculoDescricao"
>;

export type UpdateMaintenanceData = Partial<
  Omit<Maintenance, "id" | "veiculoId" | "veiculoDescricao">
>;
const ROTA = "/manutencoes";

export const manutencaoService = {
  async listar(): Promise<Maintenance[]> {
    const res = await api.get<Maintenance[]>(ROTA);
    return res.data;
  },

  async adicionar(dados: CreateMaintenanceData): Promise<Maintenance> {
    const res = await api.post<Maintenance>(ROTA, dados);
    return res.data;
  },

  async editar(id: number, dados: UpdateMaintenanceData): Promise<Maintenance> {
    const res = await api.put<Maintenance>(`${ROTA}/${id}`, dados);
    return res.data;
  },

  async excluir(id: number): Promise<void> {
    await api.delete(`${ROTA}/${id}`);
  },
};
