import "./index.css";
import App from "./App.tsx";

import React from "react";
import ReactDOM from "react-dom/client";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { PlanejamentoPage } from "./pages/PlanejamentoPage.tsx";
import { ManutencaoPage } from "./pages/ManutencaoPage.tsx";
import { MotoristaPage } from "./pages/MotoristaPage.tsx";
import { FrotaPage } from "./pages/FrotaPage.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <PlanejamentoPage />,
      },
      {
        path: "/manutencoes",
        element: <ManutencaoPage />,
      },
      {
        path: "/motoristas",
        element: <MotoristaPage />,
      },
      {
        path: "/frotas",
        element: <FrotaPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
