import styled from "styled-components";
import React from "react";
import SearchIcon from "../assets/searchIcon.svg?react";
import { useTheme } from "../styles/ThemeProvider";

import { Button } from "./ui/Button";

export interface Filtro {
  id: string;
  label: string;
}

interface FiltroGlobalProps {
  termoBusca: string;
  onTermoBuscaChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filtros: Filtro[];
  filtroAtivo: string;
  onFiltroChange: (filtroId: string) => void;
  children?: React.ReactNode;
}

const TopBarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 2rem;
  margin: 0.75rem 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);

  svg {
    width: 14px;
    height: 14px;
  }

  @media (max-width: 768px) {
    padding: 0.25rem 1rem;
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const FilterTabsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5rem;
  margin: 0.75rem 0;
  padding: 0 2rem;

  button {
    min-width: fit-content;
  }

  @media (max-width: 768px) {
    width: fit-content;
    gap: 1rem;
    padding: 0 1rem;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const TabsWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const SearchInput = styled.input`
  color: var(--color-secondaryTitle);
  padding: 0.75rem 0.5rem;
  font-weight: 500;
  background-color: transparent;
  border-radius: 6px;
  min-width: 250px;
  font-size: 1rem;

  @media (max-width: 768px) {
    min-width: 120px;
  }
`;

export function FiltroGlobal({
  termoBusca,
  onTermoBuscaChange,
  filtros,
  filtroAtivo,
  onFiltroChange,
  children,
}: FiltroGlobalProps) {
  const { theme } = useTheme();

  return (
    <>
      <TopBarContainer>
        <div style={{ display: "flex", alignItems: "center" }}>
          <SearchIcon stroke={theme.colors.primary} />
          <SearchInput
            type="text"
            placeholder="Pesquisar viagem"
            value={termoBusca}
            onChange={onTermoBuscaChange}
          />
        </div>
        <ActionsContainer>{children}</ActionsContainer>
      </TopBarContainer>

      {filtros.length > 0 && (
        <TabsWrapper>
          {" "}
          <FilterTabsContainer>
            {filtros.map((filtro) => (
              <Button
                key={filtro.id}
                variant="filter"
                isActive={filtroAtivo === filtro.id}
                onClick={() => onFiltroChange(filtro.id)}
              >
                {filtro.label}
              </Button>
            ))}
          </FilterTabsContainer>
        </TabsWrapper>
      )}
    </>
  );
}
