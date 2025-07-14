export interface Viagem {
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
}

export type UpdateViagemData = Partial<CadastroViagemData>;

const API_URL = "http://localhost:8080/viagens";

export const viagemService = {
  async listar(): Promise<Viagem[]> {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Erro ao listar viagens");
    return res.json();
  },

  async adicionar(dados: CadastroViagemData): Promise<Viagem> {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    if (!res.ok) {
      const errorMsg = await res.text();
      throw new Error(errorMsg || "Erro ao adicionar viagem");
    }
    return res.json();
  },

  async editar(id: number, dados: UpdateViagemData): Promise<Viagem> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    if (!res.ok) {
      const errorMsg = await res.text();
      throw new Error(errorMsg || "Erro ao editar viagem");
    }
    return res.json();
  },

  async excluir(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const errorMsg = await res.text();
      throw new Error(errorMsg || "Erro ao excluir viagem");
    }
  },
};
