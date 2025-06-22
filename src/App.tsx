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
    };
  } = {
    "/": {
      icon: "📅",
      title: "Planejamento",
      novoLabel: "Nova Viagem",
      novoPath: "/novo",
    },
    "/novo": {
      icon: "📅",
      title: "Planejamento",
      novoLabel: "Nova Viagem",
      novoPath: "/novo",
    },
    "/manutencoes": {
      icon: "🔧",
      title: "Manutenções",
      novoLabel: "Nova Manutenção",
      novoPath: "/manutencoes/novo",
    },
    "/frota": {
      icon: "🚚",
      title: "Frota de Veículos",
      novoLabel: "Novo Veículo",
      novoPath: "/frota/novo",
    },
    "/motoristas": {
      icon: "👨‍✈️",
      title: "Motoristas",
      novoLabel: "Novo Motorista",
      novoPath: "/motoristas/novo",
    },
  };

  const configAtual = pageConfig[location.pathname] || {
    icon: "⭐",
    title: "Dashboard",
    novoLabel: "Novo Item",
    novoPath: "/",
  };

  const handleNovoItemClick = () => {
    navigate(configAtual.novoPath);
    console.log(`Navegando para ${configAtual.novoPath}`);
  };

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <Sidebar
          novoItemLabel={configAtual.novoLabel}
          onNovoItemClick={handleNovoItemClick}
        />
        <ConteudoPrincipal>
          <HeaderGlobal
            appIcon={configAtual.icon}
            appTitle={configAtual.title}
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
