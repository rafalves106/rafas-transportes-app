import styled from "styled-components";
import React from "react";
import loupe from "../../src/assets/Loupe.png";

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
  margin-bottom: 1.5rem;
  border-top: 1px solid var(--cor-bordas);
  border-bottom: 1px solid var(--cor-bordas);
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const FilterTabsContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 3rem;
  padding-left: 2rem;
  margin-bottom: 1.5rem;
`;

const ImgInput = styled.img`
  width: 14px;
  height: 14px;
`;

const SearchInput = styled.input`
  color: var(--cor-titulos-secundaria);
  padding: 0.75rem 0.5rem;
  font-weight: 500;
  background-color: transparent;
  border-radius: 6px;
  min-width: 250px;
  font-size: 1rem;
`;

export function FiltroGlobal({
  termoBusca,
  onTermoBuscaChange,
  filtros,
  filtroAtivo,
  onFiltroChange,
  children,
}: FiltroGlobalProps) {
  return (
    <>
      <TopBarContainer>
        <div style={{ display: "flex", alignItems: "center" }}>
          <ImgInput src={loupe}></ImgInput>
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
      )}
    </>
  );
}
