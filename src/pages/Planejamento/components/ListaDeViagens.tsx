import { useState } from "react";
import styled from "styled-components";
import { tripsData } from "../../../data/TripsData";
import { CardDeViagem } from "./CardDeViagem";

const ListaContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 6rem;
  row-gap: 2rem;
  padding: 1rem;
  justify-items: center;
`;

const PaginacaoContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 0;
  gap: 1rem;
`;

const BotaoPaginacao = styled.button`
  padding: 0.5rem 1rem;
  background-color: var(--cor-secundaria);
  color: var(--cor-primaria);
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: var(--cor-fundo-card);
  }

  &:disabled {
    color: #ccc;
    cursor: not-allowed;
  }
`;

export function ListaDeViagens() {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const ITENS_POR_PAGINA = 6;

  const totalDePaginas = Math.ceil(tripsData.length / ITENS_POR_PAGINA);
  const indiceInicial = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const indiceFinal = paginaAtual * ITENS_POR_PAGINA;
  const viagensDaPagina = tripsData.slice(indiceInicial, indiceFinal);

  const proximaPagina = () => {
    if (paginaAtual < totalDePaginas) {
      setPaginaAtual(paginaAtual + 1);
    }
  };

  const paginaAnterior = () => {
    if (paginaAtual > 1) {
      setPaginaAtual(paginaAtual - 1);
    }
  };

  return (
    <>
      <ListaContainer>
        {viagensDaPagina.map((viagem) => (
          <CardDeViagem key={viagem.id} trip={viagem} />
        ))}
      </ListaContainer>

      {totalDePaginas > 1 && (
        <PaginacaoContainer>
          <BotaoPaginacao onClick={paginaAnterior} disabled={paginaAtual === 1}>
            Anterior
          </BotaoPaginacao>

          <span>
            Página {paginaAtual} de {totalDePaginas}
          </span>

          <BotaoPaginacao
            onClick={proximaPagina}
            disabled={paginaAtual === totalDePaginas}
          >
            Próxima
          </BotaoPaginacao>
        </PaginacaoContainer>
      )}
    </>
  );
}
