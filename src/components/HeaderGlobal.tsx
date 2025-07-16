import React, { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

import { Button } from "./ui/Button";

interface HeaderGlobalProps {
  appIcon: React.ReactNode;
  appTitle: string;
  onNovoItemClick: () => void;
  novoItemLabel: string;
  showActionButton: boolean;
  onToggleMenu: () => void;
}

const HambuguerButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-right: 1rem;
  z-index: 1100;

  @media (max-width: 768px) {
    display: block;
  }

  span {
    display: block;
    width: 25px;
    height: 3px;
    background-color: var(--cor-titulos);
    margin: 5px 0;
  }
`;

const HeaderContainer = styled.header`
  padding: 1rem 2rem 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;

  @media (max-width: 768px) {
    padding: 1rem 1rem 0 1rem;
    flex-direction: column;
    align-items: start;
    gap: 1rem;
  }
`;

const AppInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const AppIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background-color: var(--cor-primaria);
  padding: 0.25rem;
  border-radius: 10px;
  height: 2.5rem;
  width: 2.5rem;
`;

const AppTitle = styled.h2`
  font-size: 2.5rem;
  margin: 0;
  font-weight: 600;
  color: var(--cor-titulos);

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const AcoesContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const AppSwitcherContainer = styled.div`
  position: relative;

  @media (max-width: 768px) {
    display: none;
  }
`;

const AppSwitcherButton = styled.button`
  background-color: transparent;
  border: 1px solid #ccc;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AppSwitcherDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 0.5rem;
  width: 200px;
  z-index: 10;
  border: 1px solid #eee;
`;

const DropdownLink = styled(NavLink)`
  display: block;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: #333;
  border-radius: 6px;

  &.active,
  &:hover {
    background-color: #f1f3f5;
  }
`;

export function HeaderGlobal({
  appIcon,
  appTitle,
  onNovoItemClick,
  novoItemLabel,
  showActionButton,
  onToggleMenu,
}: HeaderGlobalProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsDropdownOpen((prevState) => !prevState);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <HeaderContainer>
      <AppInfo>
        <HambuguerButton onClick={onToggleMenu}>
          <span />
          <span />
          <span />
        </HambuguerButton>
        <AppIconContainer>{appIcon}</AppIconContainer>
        <AppTitle>{appTitle}</AppTitle>
      </AppInfo>

      <AcoesContainer>
        <AppSwitcherContainer ref={dropdownRef}>
          <AppSwitcherButton onClick={toggleDropdown}>
            Apps <span>▼</span>
          </AppSwitcherButton>

          {isDropdownOpen && (
            <AppSwitcherDropdown>
              <DropdownLink to="/" end>
                Planejamento
              </DropdownLink>
              <DropdownLink to="/manutencoes">Manutenções</DropdownLink>
              <DropdownLink to="/frota">Frota de Veículos</DropdownLink>
              <DropdownLink to="/motoristas">Motoristas</DropdownLink>
              <DropdownLink to="/calculadora">Calculadora</DropdownLink>
              <DropdownLink to="/orcamentos">Orçamentos</DropdownLink>
            </AppSwitcherDropdown>
          )}
        </AppSwitcherContainer>

        {showActionButton && (
          <Button
            style={{ width: "12rem" }}
            variant="primary"
            onClick={onNovoItemClick}
          >
            <span style={{ fontSize: "1.2rem", marginRight: "0.25rem" }}>
              +
            </span>{" "}
            {novoItemLabel}
          </Button>
        )}
      </AcoesContainer>
    </HeaderContainer>
  );
}
