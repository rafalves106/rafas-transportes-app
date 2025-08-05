import { Outlet, useLocation, useNavigate, matchPath } from "react-router-dom";
import { useInactivityLogout } from "./hooks/useInactivityLogout";
import styled from "styled-components";
import { Sidebar } from "./components/Sidebar";
import { HeaderGlobal } from "./components/HeaderGlobal";
import React, { useEffect, useState } from "react";
import PlanningIcon from "@/assets/planningIcon.svg?react";
import MaintenanceIcon from "@/assets/maintenanceIcon.svg?react";
import VehiclesIcon from "@/assets/vehiclesIcon.svg?react";
import DriversIcon from "@/assets/driversIcon.svg?react";
import CalculatorIcon from "@/assets/calculatorIcon.svg?react";
import BudgetIcon from "@/assets/budgetIcon.svg?react";

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ConteudoPrincipal = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
`;

const Backdrop = styled.div<{ isOpen: boolean }>`
  display: none;
  @media (max-width: 768px) {
    display: ${({ isOpen }) => (isOpen ? "block" : "none")};
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
`;

const AreaDaPagina = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: 0;
`;

interface PageConfig {
  icon: React.ReactNode;
  title: string;
  novoLabel: string;
  novoPath: string;
  showActionButton: boolean;
}

const pageConfig: { [key: string]: PageConfig } = {
  "/": {
    icon: <PlanningIcon />,
    title: "Planejamento",
    novoLabel: "Nova Viagem",
    novoPath: "/novo",
    showActionButton: true,
  },
  "/novo": {
    icon: <PlanningIcon />,
    title: "Planejamento",
    novoLabel: "Nova Viagem",
    novoPath: "/novo",
    showActionButton: true,
  },
  "/editar/:tripId": {
    icon: <PlanningIcon />,
    title: "Planejamento",
    novoLabel: "Nova Viagem",
    novoPath: "/novo",
    showActionButton: true,
  },
  "/manutencoes": {
    icon: <MaintenanceIcon />,
    title: "Manutenções",
    novoLabel: "Nova Manutenção",
    novoPath: "/manutencoes/novo",
    showActionButton: true,
  },
  "/frota": {
    icon: <VehiclesIcon />,
    title: "Frota",
    novoLabel: "Novo Veículo",
    novoPath: "/frota/novo",
    showActionButton: true,
  },
  "/motoristas": {
    icon: <DriversIcon />,
    title: "Motoristas",
    novoLabel: "Novo Motorista",
    novoPath: "/motoristas/novo",
    showActionButton: true,
  },
  "/calculadora": {
    icon: <CalculatorIcon />,
    title: "Calculadora",
    novoLabel: "",
    novoPath: "",
    showActionButton: false,
  },
  "/orcamentos": {
    icon: <BudgetIcon />,
    title: "Orçamentos",
    novoLabel: "Novo Orçamento",
    novoPath: "/orcamentos/novo",
    showActionButton: false,
  },
};

const defaultConfig: PageConfig = {
  icon: "⭐",
  title: "Dashboard",
  novoLabel: "Novo Item",
  novoPath: "/",
  showActionButton: false,
};

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  useInactivityLogout();

  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [configAtual, setConfigAtual] = useState(defaultConfig);

  const toggleMenu = () => {
    if (!isModalOpen) {
      setMenuOpen(!isMenuOpen);
    }
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    let matchingPath = Object.keys(pageConfig).find((path) =>
      matchPath({ path }, location.pathname)
    );

    if (!matchingPath) {
      matchingPath = Object.keys(pageConfig).find(
        (path) => location.pathname.startsWith(path) && path !== "/"
      );
    }

    const finalMatchingPath = matchingPath || "/";

    setConfigAtual(
      pageConfig[finalMatchingPath as keyof typeof pageConfig] || defaultConfig
    );

    if (isMenuOpen) {
      setMenuOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleNovoItemClick = () => {
    if (configAtual.novoPath) {
      navigate(configAtual.novoPath);
    }
  };

  return (
    <>
      <Backdrop isOpen={isMenuOpen} onClick={toggleMenu} />
      <AppContainer>
        <Sidebar
          isOpen={isMenuOpen}
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
            onToggleMenu={toggleMenu}
            isModalOpen={isModalOpen}
          />
          <AreaDaPagina>
            <Outlet context={{ setIsModalOpen }} />
          </AreaDaPagina>
        </ConteudoPrincipal>
      </AppContainer>
    </>
  );
}

export default App;
