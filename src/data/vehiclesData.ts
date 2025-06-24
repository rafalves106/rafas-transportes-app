export interface Vehicle {
  id: number;
  model: string;
  plate: string;
}

export const vehiclesData: Vehicle[] = [
  { id: 1, model: "Sprinter 416", plate: "GHF5G42" },
  { id: 2, model: "Van Ducato", plate: "ABC1D23" },
  { id: 3, model: "Ônibus Executivo", plate: "XYZ8T90" },
];
