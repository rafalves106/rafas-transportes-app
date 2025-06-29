export interface Maintenance {
  id: number;
  vehicleId: number;
  title: string;
  type: "Preventiva" | "Corretiva";
  date: string;
  cost: number;
  status: "Agendada" | "Realizada";
}

export const maintenancesData: Maintenance[] = [
  {
    id: 1,
    vehicleId: 1,
    title: "Troca de Óleo e Filtros",
    type: "Preventiva",
    date: "2025-06-20",
    cost: 450.5,
    status: "Realizada",
  },
  {
    id: 2,
    vehicleId: 2,
    title: "Revisão dos Freios",
    type: "Corretiva",
    date: "2025-05-15",
    cost: 800.0,
    status: "Realizada",
  },
  {
    id: 3,
    vehicleId: 1,
    title: "Alinhamento e Balanceamento",
    type: "Preventiva",
    date: "2025-07-10",
    cost: 250.0,
    status: "Agendada",
  },
];
