export interface Trip {
  id: number;
  title: string;
  clientName: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  startLocation: string;
  endLocation: string;
  value: number;
  status: "Agendada" | "Realizada" | "Cancelada";
  vehicleId: number;
  driverId: number;
}

export const tripsData: Trip[] = [
  {
    id: 1,
    title: "Reserva Juliana",
    clientName: "Juliana Camargo",
    startDate: "2025-06-25",
    startTime: "09:30",
    endDate: "2025-06-30",
    endTime: "18:30",
    startLocation:
      "Buscar passageiros no bairro Palmares e deixá-los no aeroporto de Confins. ",
    endLocation:
      "Retornar com passageiros no aeroporto de Confins e desembarca-los no bairro Palmares",
    value: 700.0,
    status: "Agendada",
    vehicleId: 1,
    driverId: 1,
  },
  {
    id: 2,
    title: "Reserva Paulo",
    clientName: "Paulo Alves",
    startDate: "2025-06-25",
    startTime: "09:30",
    endDate: "2025-06-30",
    endTime: "18:30",
    startLocation:
      "Buscar passageiros no bairro Palmares e deixá-los no aeroporto de Confins. ",
    endLocation:
      "Retornar com passageiros no aeroporto de Confins e desembarca-los no bairro Palmares",
    value: 500.0,
    status: "Agendada",
    vehicleId: 2,
    driverId: 2,
  },
  {
    id: 3,
    title: "Reserva Paulo",
    clientName: "Paulo Alves",
    startDate: "2025-06-25",
    startTime: "09:30",
    endDate: "2025-06-30",
    endTime: "18:30",
    startLocation:
      "Buscar passageiros no bairro Palmares e deixá-los no aeroporto de Confins. ",
    endLocation:
      "Retornar com passageiros no aeroporto de Confins e desembarca-los no bairro Palmares",
    value: 500.0,
    status: "Agendada",
    vehicleId: 2,
    driverId: 2,
  },
  {
    id: 4,
    title: "Reserva Paulo",
    clientName: "Paulo Alves",
    startDate: "2025-06-25",
    startTime: "09:30",
    endDate: "2025-06-30",
    endTime: "18:30",
    startLocation:
      "Buscar passageiros no bairro Palmares e deixá-los no aeroporto de Confins. ",
    endLocation:
      "Retornar com passageiros no aeroporto de Confins e desembarca-los no bairro Palmares",
    value: 500.0,
    status: "Agendada",
    vehicleId: 2,
    driverId: 2,
  },
  {
    id: 5,
    title: "Reserva Paulo",
    clientName: "Paulo Alves",
    startDate: "2025-06-25",
    startTime: "09:30",
    endDate: "2025-06-30",
    endTime: "18:30",
    startLocation:
      "Buscar passageiros no bairro Palmares e deixá-los no aeroporto de Confins. ",
    endLocation:
      "Retornar com passageiros no aeroporto de Confins e desembarca-los no bairro Palmares",
    value: 500.0,
    status: "Agendada",
    vehicleId: 2,
    driverId: 2,
  },
  {
    id: 6,
    title: "Reserva Paulo",
    clientName: "Paulo Alves",
    startDate: "2025-06-25",
    startTime: "09:30",
    endDate: "2025-06-30",
    endTime: "18:30",
    startLocation:
      "Buscar passageiros no bairro Palmares e deixá-los no aeroporto de Confins. ",
    endLocation:
      "Retornar com passageiros no aeroporto de Confins e desembarca-los no bairro Palmares",
    value: 500.0,
    status: "Agendada",
    vehicleId: 2,
    driverId: 2,
  },
  {
    id: 7,
    title: "Reserva Paulo",
    clientName: "Paulo Alves",
    startDate: "2025-06-25",
    startTime: "09:30",
    endDate: "2025-06-30",
    endTime: "18:30",
    startLocation:
      "Buscar passageiros no bairro Palmares e deixá-los no aeroporto de Confins. ",
    endLocation:
      "Retornar com passageiros no aeroporto de Confins e desembarca-los no bairro Palmares",
    value: 500.0,
    status: "Agendada",
    vehicleId: 2,
    driverId: 2,
  },
];
