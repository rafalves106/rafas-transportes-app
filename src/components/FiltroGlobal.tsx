import styled from "styled-components";
import React from "react";

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
  padding: 0.5rem 1rem;
  margin-bottom: 0.5rem;
`;

const FilterTabsContainer = styled.div`
  padding: 0 1rem 1rem;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const SearchInput = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  min-width: 250px;
  font-size: 1rem;
`;

const BotaoFiltro = styled.button<{ isActive: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--cor-primaria);
  background-color: ${(props) =>
    props.isActive ? "var(--cor-primaria)" : "transparent"};
  color: ${(props) => (props.isActive ? "white" : "var(--cor-primaria)")};
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
        <SearchInput
          type="text"
          placeholder="Pesquisar viagem..."
          value={termoBusca}
          onChange={onTermoBuscaChange}
        />
        <div>{children}</div>
      </TopBarContainer>

      <FilterTabsContainer>
        {filtros.map((filtro) => (
          <BotaoFiltro
            key={filtro.id}
            isActive={filtroAtivo === filtro.id}
            onClick={() => onFiltroChange(filtro.id)}
          >
            {filtro.label}
          </BotaoFiltro>
        ))}
      </FilterTabsContainer>
    </>
  );
}
