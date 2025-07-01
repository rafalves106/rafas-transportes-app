import { Outlet, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { GlobalStyle } from "./styles/GlobalStyle";
import { Sidebar } from "./components/Sidebar";
import { HeaderGlobal } from "./components/HeaderGlobal";

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
`;

function App() {
  const location = useLocation();
  const navigate = useNavigate();

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
            <Outlet />
          </AreaDaPagina>
        </ConteudoPrincipal>
      </AppContainer>
    </>
  );
}

export default App;
