import { NavLink, useNavigate } from "react-router-dom";
import styled from "styled-components";
import logo from "../../src/assets/logo.webp";
import plannningIcon from "../assets/planningIcon.svg";
import maintenanceIcon from "../assets/maintenanceIcon.svg";
import vehiclesIcon from "../assets/vehiclesIcon.svg";
import driversIcon from "../assets/driversIcon.svg";
import calculatorIcon from "../assets/calculatorIcon.svg";
import budgetIcon from "../assets/budgetIcon.svg";
import exitIcon from "../assets/exitIcon.svg";
import { Button } from "./ui/Button";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../styles/ThemeProvider";

interface SidebarProps {
  novoItemLabel: string;
  onNovoItemClick: () => void;
  showActionButton: boolean;
  isOpen: boolean;
}

const SidebarContainer = styled.aside<{ isOpen: boolean }>`
  background-color: var(--color-background);
  width: 280px;
  min-width: 280px;
  padding: 2rem 2rem;
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.3s ease-in-out;

  @media (max-width: 768px) {
    padding: 0 1rem;
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    width: 100vw;
    margin: 0;
    z-index: 1000;
    border: none;
    transform: ${({ isOpen }) =>
      isOpen ? "translateX(0)" : "translateX(-100%)"};
  }
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const EmpresaInfo = styled.div`
  display: flex;
  justify-content: center;

  img {
    width: 8rem;
    height: auto;

    @media (max-width: 760px) {
      width: 6rem;
    }
  }

  @media (max-width: 768px) {
    margin-top: 1rem;
  }
`;

const NavList = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0.75rem 1rem;
  gap: 0.5rem;
  border-radius: 6px;
  text-decoration: none;
  color: var(--color-text);
  font-weight: 400;
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;

  img {
    width: auto;
    height: 0.9rem;
  }

  &:hover {
    background-color: var(--color-cardBackground);
  }

  &.active {
    background-color: var(--color-activeCardBackground);
    color: var(--color-text);
  }
`;

const BottomSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const LogoutButton = styled.a`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: var(--color-cardBackground);
  border-radius: 6px;
  text-decoration: none;
  color: var(--color-text);
  padding: 0.75rem 1rem;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;

  img {
    width: 16px;
    height: auto;
  }

  &:hover {
    background-color: var(--color-border);
  }
`;

const ThemeToggleButton = styled(Button)`
  width: 100%;
  margin-top: 1rem;
  background-color: var(--color-secondary);
  color: var(--color-infoText);
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;

  &:hover {
    background-color: var(--color-primary);
  }
`;

export function Sidebar({
  novoItemLabel,
  onNovoItemClick,
  showActionButton,
  isOpen,
}: SidebarProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { toggleTheme, currentThemeName } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <SidebarContainer isOpen={isOpen}>
      <ContentContainer>
        <EmpresaInfo>
          <img src={logo} alt="Logo" />
        </EmpresaInfo>
        {showActionButton && (
          <Button variant="primary" onClick={onNovoItemClick}>
            <span style={{ fontSize: "1.2rem", marginRight: "0.25rem" }}>
              +
            </span>{" "}
            {novoItemLabel}
          </Button>
        )}

        <NavList>
          <StyledNavLink to="/" end>
            <img src={plannningIcon} alt="Planejamento" />
            Planejamento
          </StyledNavLink>
          <StyledNavLink to="/manutencoes">
            <img src={maintenanceIcon} alt="Planejamento" />
            Manutenções
          </StyledNavLink>
          <StyledNavLink to="/frota">
            {" "}
            <img src={vehiclesIcon} alt="Planejamento" />
            Frota de Veículos
          </StyledNavLink>
          <StyledNavLink to="/motoristas">
            {" "}
            <img src={driversIcon} alt="Planejamento" />
            Motoristas
          </StyledNavLink>
          <StyledNavLink to="/calculadora">
            <img src={calculatorIcon} alt="Calculadora" />
            Calculadora
          </StyledNavLink>
          <StyledNavLink to="/orcamentos">
            <img src={budgetIcon} alt="Orçamentos" />
            Orçamentos
          </StyledNavLink>
        </NavList>
      </ContentContainer>
      <BottomSection>
        <ThemeToggleButton variant="secondary" onClick={toggleTheme}>
          Mudar para {currentThemeName === "light" ? "Dark" : "Light"}
        </ThemeToggleButton>
        <LogoutButton onClick={handleLogout}>
          <img src={exitIcon} alt="LogOut Icon" />
          <span>Sair</span>
        </LogoutButton>
      </BottomSection>
    </SidebarContainer>
  );
}
