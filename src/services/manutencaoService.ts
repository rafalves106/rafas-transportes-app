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

const API_URL = "http://localhost:8080/manutencoes";

export const manutencaoService = {
  async listar(): Promise<Maintenance[]> {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Erro ao listar as manutenções");
    return res.json();
  },

  async adicionar(dados: CreateMaintenanceData): Promise<Maintenance> {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    if (!res.ok) {
      const errorMsg = await res.text();
      throw new Error(errorMsg || "Não foi possível adicionar a manutenção.");
    }
    return res.json();
  },

  async editar(id: number, dados: UpdateMaintenanceData): Promise<Maintenance> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    if (!res.ok) {
      const errorMsg = await res.text();
      throw new Error(errorMsg || "Não foi possível editar a manutenção.");
    }
    return res.json();
  },

  async excluir(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Erro ao excluir a manutenção");
  },
};
