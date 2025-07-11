import "./index.css";
import App from "./App.tsx";

import React from "react";
import ReactDOM from "react-dom/client";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { PlanejamentoPage } from "./pages/PlanejamentoPage.tsx";
import { ManutencaoPage } from "./pages/ManutencaoPage.tsx";
import { MotoristaPage } from "./pages/MotoristaPage.tsx";
import { FrotaPage } from "./pages/FrotaPage.tsx";
import { CalculadoraPage } from "./pages/CalculadoraPage.tsx";
import { OrcamentosPage } from "./pages/OrcamentoPage.tsx";

import { FormularioNovaViagem } from "./pages/Planejamento/components/FormNovaViagem.tsx";
import { FormularioNovoVeiculo } from "./pages/Frota/components/FormularioNovoVeiculo.tsx";
import { FormularioNovaManutencao } from "./pages/Manutencoes/components/FormularioNovaManutencao.tsx";
import { FormularioNovoMotorista } from "./pages/Motorista/components/FormularioNovoMotorista.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <PlanejamentoPage />,
        children: [
          {
            path: "novo",
            element: <FormularioNovaViagem />,
          },
          {
            path: "editar/:tripId",
            element: <FormularioNovaViagem />,
          },
        ],
      },
      {
        path: "manutencoes",
        element: <ManutencaoPage />,
        children: [
          {
            path: "novo",
            element: <FormularioNovaManutencao />,
          },
          {
            path: "editar/:maintenanceId",
            element: <FormularioNovaManutencao />,
          },
        ],
      },
      {
        path: "motoristas",
        element: <MotoristaPage />,
        children: [
          {
            path: "novo",
            element: <FormularioNovoMotorista />,
          },
          {
            path: "editar/:driverId",
            element: <FormularioNovoMotorista />,
          },
        ],
      },
      {
        path: "frota",
        element: <FrotaPage />,
        children: [
          {
            path: "novo",
            element: <FormularioNovoVeiculo />,
          },
          {
            path: "editar/:vehicleId",
            element: <FormularioNovoVeiculo />,
          },
        ],
      },
      {
        path: "calculadora",
        element: <CalculadoraPage />,
      },
      {
        path: "orcamentos",
        element: <OrcamentosPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
