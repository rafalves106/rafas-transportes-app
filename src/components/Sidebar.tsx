import { NavLink, useNavigate } from "react-router-dom";
import styled from "styled-components";
import logo from "../../src/assets/logo.webp";
import planLogo from "../assets/planlogo.png";
import manuLogo from "../assets/manulogo.png";
import frotaLogo from "../assets/frotalogo.png";
import motoLogo from "../assets/motologo.png";
import adicionar from "../assets/Plus.png";
import calcLogo from "../assets/calcLogo.png";
import orcamentoLogo from "../assets/orcamentoLogo.png";
import logoutIcon from "../assets/LogoutIcon.png";
import { Button } from "./ui/Button";
import { useAuth } from "../contexts/AuthContext";

interface SidebarProps {
  novoItemLabel: string;
  onNovoItemClick: () => void;
  showActionButton: boolean;
  isOpen: boolean;
}

const SidebarContainer = styled.aside<{ isOpen: boolean }>`
  background-color: var(--cor-de-fundo);
  width: 280px;
  min-width: 280px;
  margin: 2.5rem 0;
  padding: 0 2rem;
  border-right: 1px solid #dee2e6;
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
  flex-direction: row;
  justify-content: space-between;

  @media (max-width: 768px) {
    margin-top: 5rem;
  }
`;

const LogoContainer = styled.div`
  img {
    width: 4.5rem;
    height: auto;

    @media (max-width: 760px) {
      width: 6rem;
    }
  }
`;

const DataContainer = styled.div`
  display: flex;
  flex-direction: column;
  text-align: end;
`;

const Naming = styled.h4`
  font-size: 0.9rem;
  font-weight: 600;

  @media (max-width: 760px) {
    font-size: 1.3rem;
  }
`;

const Data = styled.p`
  font-size: 0.7rem;

  @media (max-width: 760px) {
    font-size: 1rem;
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
  color: var(--cor-titulo);
  font-weight: 400;
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;

  img {
    width: auto;
    height: 0.9rem;
  }

  &:hover {
    background-color: var(--cor-de-fundo-cards);
  }

  &.active {
    background-color: var(--cor-de-fundo-cards);
    color: var(--cor-titulo);
  }
`;

const LogOffSection = styled.a`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: var(--cor-de-fundo-cards);
  border-radius: 6px;
  text-decoration: none;
  color: var(--cor-titulo);
  padding: 0.75rem 1rem;
  cursor: pointer;

  img {
    width: 16px;
    height: auto;
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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <SidebarContainer isOpen={isOpen}>
      <ContentContainer>
        <EmpresaInfo>
          <LogoContainer>
            <img src={logo} alt="Logo" />
          </LogoContainer>
          <DataContainer>
            <Naming>Rafas Transportes</Naming>
            <Data>11.434.565/0001-01</Data>
          </DataContainer>
        </EmpresaInfo>
        {showActionButton && (
          <Button variant="primary" onClick={onNovoItemClick}>
            <img
              src={adicionar}
              alt="Adicionar"
              style={{ width: "1.4rem", height: "1.4rem" }}
            />
            {novoItemLabel}
          </Button>
        )}

        <NavList>
          <StyledNavLink to="/" end>
            <img src={planLogo} alt="Planejamento" />
            Planejamento
          </StyledNavLink>
          <StyledNavLink to="/manutencoes">
            <img src={manuLogo} alt="Planejamento" />
            Manutenções
          </StyledNavLink>
          <StyledNavLink to="/frota">
            {" "}
            <img src={frotaLogo} alt="Planejamento" />
            Frota de Veículos
          </StyledNavLink>
          <StyledNavLink to="/motoristas">
            {" "}
            <img src={motoLogo} alt="Planejamento" />
            Motoristas
          </StyledNavLink>
          <StyledNavLink to="/calculadora">
            <img src={calcLogo} alt="Calculadora" />
            Calculadora
          </StyledNavLink>
          <StyledNavLink to="/orcamentos">
            <img src={orcamentoLogo} alt="Orçamentos" />
            Orçamentos
          </StyledNavLink>
        </NavList>
      </ContentContainer>
      <LogOffSection onClick={handleLogout}>
        <img src={logoutIcon} alt="LogOut Icon" />
        <span>Sair</span>
      </LogOffSection>
    </SidebarContainer>
  );
}
