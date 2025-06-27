export interface Vehicle {
  id: number;
  model: string;
  plate: string;
  status: "Ativo" | "Inativo" | "Em Manutenção";
}

export const vehiclesData: Vehicle[] = [
  { id: 1, model: "Sprinter 416", plate: "GHF5G42", status: "Ativo" },
  { id: 2, model: "Van Ducato", plate: "ABC1D23", status: "Inativo" },
  {
    id: 3,
    model: "Ônibus Executivo",
    plate: "XYZ8T90",
    status: "Em Manutenção",
  },
];
