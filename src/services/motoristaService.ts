export interface Driver {
  id: number;
  nome: string;
  cpf: string;
  cnh: string;
  validadeCnh: string;
  telefone: string;
  status: string;
}

export type CadastroDriverData = Omit<Driver, "id" | "status">;
export type UpdateDriverData = Partial<CadastroDriverData>;

const API_URL = "http://localhost:8080/motoristas";

export const motoristaService = {
  async listar(): Promise<Driver[]> {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Erro ao listar motoristas");
    return res.json();
  },

  async adicionar(dados: CadastroDriverData): Promise<Driver> {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    if (!res.ok) {
      const errorMsg = await res.text();
      throw new Error(errorMsg || "Erro ao adicionar motorista");
    }
    return res.json();
  },

  async editar(id: number, dados: UpdateDriverData): Promise<Driver> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    if (!res.ok) {
      const errorMsg = await res.text();
      throw new Error(errorMsg || "Erro ao editar motorista");
    }
    return res.json();
  },

  async excluir(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const errorMsg = await res.text();
      throw new Error(errorMsg || "Erro ao excluir motorista");
    }
  },
};
