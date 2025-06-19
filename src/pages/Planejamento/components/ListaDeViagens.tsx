import { useState, useEffect } from "react";
import styled from "styled-components";
import type { Trip } from "../../../data/TripsData";
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
  justify-content: end;
  align-items: center;
`;

const BotaoPaginacao = styled.button`
  cursor: pointer;
  background-color: transparent;

  img {
    width: 18px;
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

interface ListaDeViagensProps {
  viagens: Trip[];
}

export function ListaDeViagens({ viagens }: ListaDeViagensProps) {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const ITENS_POR_PAGINA = 6;

  useEffect(() => {
    setPaginaAtual(1);
  }, [viagens]);

  const totalDePaginas = Math.ceil(viagens.length / ITENS_POR_PAGINA);
  const indiceInicial = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const indiceFinal = paginaAtual * ITENS_POR_PAGINA;
  const viagensDaPagina = viagens.slice(indiceInicial, indiceFinal);

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

  if (viagens.length === 0) {
    return <p>Nenhuma viagem encontrada para este filtro.</p>;
  }

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
            <img src="src/assets/Expand Arrow.png"></img>
          </BotaoPaginacao>

          <BotaoPaginacao
            onClick={proximaPagina}
            disabled={paginaAtual === totalDePaginas}
          >
            <img src="src/assets/Expand Arrow-right.png"></img>
          </BotaoPaginacao>
        </PaginacaoContainer>
      )}
    </>
  );
}
