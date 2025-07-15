import api from "./api";

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

const ROTA = "/motoristas";

export const motoristaService = {
  async listar(): Promise<Driver[]> {
    const res = await api.get<Driver[]>(ROTA);
    return res.data;
  },

  async adicionar(dados: CadastroDriverData): Promise<Driver> {
    const res = await api.post<Driver>(ROTA, dados);
    return res.data;
  },

  async editar(id: number, dados: UpdateDriverData): Promise<Driver> {
    const res = await api.put<Driver>(`${ROTA}/${id}`, dados);
    return res.data;
  },

  async excluir(id: number): Promise<void> {
    await api.delete(`${ROTA}/${id}`);
  },
};
