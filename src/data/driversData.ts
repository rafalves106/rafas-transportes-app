export interface Driver {
  id: number;
  name: string;
  phone: string;
  licenseNumber: string;
  status: "Ativo" | "Inativo" | "Férias";
}

export const driversData: Driver[] = [
  {
    id: 1,
    name: "Robson Almeida",
    phone: "(31) 99999-1111",
    licenseNumber: "01234567890",
    status: "Ativo",
  },
  {
    id: 2,
    name: "Carlos Pereira",
    phone: "(31) 99999-2222",
    licenseNumber: "09876543210",
    status: "Ativo",
  },
  {
    id: 3,
    name: "Ana Souza",
    phone: "(31) 99999-3333",
    licenseNumber: "05432167890",
    status: "Férias",
  },
  {
    id: 4,
    name: "Marcos Lima",
    phone: "(31) 99999-4444",
    licenseNumber: "01234567899",
    status: "Inativo",
  },
];
