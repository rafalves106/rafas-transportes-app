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

  formData: {
    origem: string;
    destino: string;
    paradas: string[];
    veiculos: { id: string; passageiros: number }[];
    motoristas: { id: string }[];
  };

  status: "Pendente" | "Aprovado" | "Recusado";
}

export const orcamentosData: Orcamento[] = [];
