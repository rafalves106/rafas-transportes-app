export interface Vehicle {
  id: number;
  model: string;
  plate: string;
  status: string;
}

type UpdateVehicleData = Omit<Vehicle, "id">;

const API_URL = "http://localhost:8080/api/veiculos";

export const veiculoService = {
  async listar(): Promise<Vehicle[]> {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Erro ao listar veículos");
    return res.json();
  },

  async adicionar(dados: Omit<Vehicle, "id">): Promise<void> {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    if (!res.ok) {
      const errorMsg = await res.text();
      throw new Error(errorMsg || "Erro ao adicionar veículo");
    }
  },

  async editar(id: number, dados: UpdateVehicleData): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    if (!res.ok) {
      const errorMsg = await res.text();
      throw new Error(errorMsg || "Não foi possível editar o veículo.");
    }
  },

  async excluir(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const errorMsg = await res.text();
      throw new Error(errorMsg || "Erro ao excluir veículo");
    }
  },
};
