import api from "./api";

// Interface para os dados de Viagem retornados pelo backend (DadosDetalhamentoViagem)
export interface Viagem {
  id: number;
  title: string;
  clientName: string;
  telefone: string;
  valor: number; // BigDecimal no backend, number no JS
  startLocation: string;
  endLocation: string;
  veiculoId: number;
  veiculoInfo: string; // Ex: "Modelo (Placa)"
  motoristaId: number;
  motoristaNome: string; // Ex: "Nome do Motorista"
  startDate: string; // Formato "YYYY-MM-DD"
  startTime: string; // Formato "HH:MM"
  endDate: string; // Formato "YYYY-MM-DD"
  endTime: string; // Formato "HH:MM"
  status: "AGENDADA" | "EM_CURSO" | "FINALIZADA" | "CANCELADA"; // Agora um enum string no backend
  tipoViagem: string;
}

// Interface para os dados de Cadastro de Viagem enviados ao backend (DadosCadastroViagem)
// O status é obrigatório no cadastro, como definido no backend.
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
  status: "AGENDADA" | "EM_CURSO" | "FINALIZADA" | "CANCELADA";
  tipoViagem: string;
}

// Interface para os dados de Atualização de Viagem enviados ao backend (DadosAtualizacaoViagem)
// Todos os campos são opcionais, exceto o ID da viagem a ser atualizada
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
