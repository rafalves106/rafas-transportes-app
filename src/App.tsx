import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { GlobalStyle } from "./styles/GlobalStyle";
import { Sidebar } from "./components/Sidebar";
import { HeaderGlobal } from "./components/HeaderGlobal";

import { tripsData as initialTripsData, type Trip } from "./data/tripsData";
import {
  vehiclesData as initialVehiclesData,
  type Vehicle,
} from "./data/vehiclesData";
import {
  driversData as initialDriversData,
  type Driver,
} from "./data/driversData";
import {
  maintenancesData as initialMaintenancesData,
  type Maintenance,
} from "./data/maintenanceData";
import {
  orcamentosData as initialOrcamentos,
  type Orcamento,
} from "./data/orcamentosData";

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  max-height: 100vh;
`;

const ConteudoPrincipal = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const AreaDaPagina = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: 0 2rem 2rem 2rem;
`;

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [viagens, setViagens] = useState<Trip[]>(initialTripsData);
  const [veiculos, setVeiculos] = useState<Vehicle[]>(initialVehiclesData);
  const [motoristas, setMotoristas] = useState<Driver[]>(initialDriversData);
  const [manutencoes, setManutencoes] = useState<Maintenance[]>(
    initialMaintenancesData
  );
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>(initialOrcamentos);

  const pageConfig: {
    [key: string]: {
      icon: string;
      title: string;
      novoLabel: string;
      novoPath: string;
      showActionButton: boolean;
    };
  } = {
    "/": {
      icon: "📅",
      title: "Planejamento",
      novoLabel: "Nova Viagem",
      novoPath: "/novo",
      showActionButton: true,
    },
    "/novo": {
      icon: "📅",
      title: "Planejamento",
      novoLabel: "Nova Viagem",
      novoPath: "/novo",
      showActionButton: true,
    },
    "/editar/:tripId": {
      icon: "📅",
      title: "Planejamento",
      novoLabel: "Nova Viagem",
      novoPath: "/novo",
      showActionButton: true,
    },
    "/manutencoes": {
      icon: "🔧",
      title: "Manutenções",
      novoLabel: "Nova Manutenção",
      novoPath: "/manutencoes/novo",
      showActionButton: true,
    },
    "/frota": {
      icon: "🚚",
      title: "Frota",
      novoLabel: "Novo Veículo",
      novoPath: "/frota/novo",
      showActionButton: true,
    },
    "/motoristas": {
      icon: "👨‍✈️",
      title: "Motoristas",
      novoLabel: "Novo Motorista",
      novoPath: "/motoristas/novo",
      showActionButton: true,
    },
    "/calculadora": {
      icon: "🧮",
      title: "Calculadora",
      novoLabel: "",
      novoPath: "",
      showActionButton: false,
    },
    "/orcamentos": {
      icon: "📄",
      title: "Orçamentos Salvos",
      novoLabel: "",
      novoPath: "",
      showActionButton: false,
    },
  };

  const configAtual = pageConfig[location.pathname] || {
    icon: "⭐",
    title: "Dashboard",
    novoLabel: "Novo Item",
    novoPath: "/",
    showActionButton: false,
  };

  const handleNovoItemClick = () => {
    navigate(configAtual.novoPath);
  };

  const handleAdicionarOrcamento = (orcamento: Orcamento) => {
    setOrcamentos((prev) => [orcamento, ...prev]);
  };

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <Sidebar
          showActionButton={configAtual.showActionButton}
          novoItemLabel={configAtual.novoLabel}
          onNovoItemClick={handleNovoItemClick}
        />
        <ConteudoPrincipal>
          <HeaderGlobal
            appIcon={configAtual.icon}
            appTitle={configAtual.title}
            showActionButton={configAtual.showActionButton}
            onNovoItemClick={handleNovoItemClick}
            novoItemLabel={configAtual.novoLabel}
          />
          <AreaDaPagina>
            <Outlet
              context={{
                viagens,
                setViagens,
                veiculos,
                setVeiculos,
                motoristas,
                setMotoristas,
                manutencoes,
                setManutencoes,
                orcamentos,
                onAdicionarOrcamento: handleAdicionarOrcamento,
              }}
            />
          </AreaDaPagina>
        </ConteudoPrincipal>
      </AppContainer>
    </>
  );
}

export default App;
