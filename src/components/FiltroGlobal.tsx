import styled from "styled-components";
import React from "react";
import loupe from "../../src/assets/Loupe.png";

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

const BotaoFiltro = styled.button<{ isActive: boolean }>`
  font-size: 16px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  background-color: transparent;
  color: ${(props) =>
    props.isActive ? "var(--cor-titulos)" : "var(--cor-titulos-secundaria)"};
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
            <BotaoFiltro
              key={filtro.id}
              isActive={filtroAtivo === filtro.id}
              onClick={() => onFiltroChange(filtro.id)}
            >
              {filtro.label}
            </BotaoFiltro>
          ))}
        </FilterTabsContainer>
      )}
    </>
  );
}
