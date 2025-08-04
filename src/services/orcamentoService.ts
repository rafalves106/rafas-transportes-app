import api from "./api";
import { Decimal } from "decimal.js";

export interface Orcamento {
  id: number;
  nomeCliente: string;
  telefone: string;
  dataDoOrcamento: string;
  origem: string;
  destino: string;
  distancia: string;
  valorTotal: number;
  paradas: string;
  tipoViagemOrcamento?: string;
  descricaoIdaOrcamento?: string;
  descricaoVoltaOrcamento?: string;
  textoGerado?: string;
  custoDistancia?: number;
  custoPedagios?: number;
  custoCombustivel?: number;
  custoMotorista?: number;
}

export interface CadastroOrcamentoData {
  nomeCliente: string;
  telefone: string;
  origem: string;
  destino: string;
  distancia: string;
  paradas: string;
  valorTotal: number;
  tipoViagemOrcamento?: string;
  descricaoIdaOrcamento?: string;
  descricaoVoltaOrcamento?: string;
  textoGerado?: string;
}

const ROTA = "/orcamentos";

export const orcamentoService = {
  async listar(): Promise<Orcamento[]> {
    const res = await api.get<Orcamento[]>(ROTA);
    return res.data;
  },

  async salvar(dados: CadastroOrcamentoData): Promise<Orcamento> {
    const res = await api.post<Orcamento>(ROTA, {
      ...dados,
      valorTotal: new Decimal(dados.valorTotal).toString(),
    });
    return res.data;
  },

  excluir: async (id: number): Promise<void> => {
    await api.delete(`/orcamentos/${id}`);
  },
};
