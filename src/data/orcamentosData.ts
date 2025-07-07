import type { OrcamentoForm } from "../pages/CalculadoraPage";

export interface Orcamento {
  id: number;
  title: string;
  clientName: string;
  custoDistancia: number;
  distanciaTotal: number;
  custoPedagios: number;
  custoCombustivel: number;
  custoMotorista: number;
  valorTotal: number;

  formData: OrcamentoForm;

  status: "Pendente" | "Aprovado" | "Recusado";
}

export const orcamentosData: Orcamento[] = [];
