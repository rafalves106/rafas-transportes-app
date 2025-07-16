import { Outlet, useLocation, useNavigate, matchPath } from "react-router-dom";
import styled from "styled-components";
import { Sidebar } from "./components/Sidebar";
import { HeaderGlobal } from "./components/HeaderGlobal";
import { useEffect, useState } from "react";

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  max-height: 100vh;

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
  padding: 0 2rem 2rem 2rem;
`;

const pageConfig = {
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

const defaultConfig = {
  icon: "⭐",
  title: "Dashboard",
  novoLabel: "Novo Item",
  showActionButton: false,
};

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isMenuOpen, setMenuOpen] = useState(false);
  const [configAtual, setConfigAtual] = useState(defaultConfig);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const matchingPath = Object.keys(pageConfig).find((path) =>
      matchPath({ path, end: true }, location.pathname)
    );
    setConfigAtual(
      matchingPath
        ? pageConfig[matchingPath as keyof typeof pageConfig]
        : defaultConfig
    );

    if (isMenuOpen) {
      setMenuOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleNovoItemClick = () => {
    navigate(`${location.pathname}/novo`);
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
          />
          <AreaDaPagina>
            <Outlet context={{}} />
          </AreaDaPagina>
        </ConteudoPrincipal>
      </AppContainer>
    </>
  );
}

export default App;
