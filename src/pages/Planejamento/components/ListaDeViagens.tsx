import { useState, useEffect } from "react";
import styled from "styled-components";
import type { Trip } from "../../../data/tripsData";
import { CardDeViagem } from "./CardDeViagem";
import BtnPagLft from "../../../assets/Expand Arrow.png";
import BtnPagRgt from "../../../assets/Expand Arrow-right.png";

const ListaContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  column-gap: 2rem;
  row-gap: 2rem;
  padding: 0 2rem;
`;

const PaginacaoContainer = styled.div`
  position: absolute;
  bottom: 2rem;
  right: 0;
  padding-right: 2rem;
  display: flex;
  justify-content: end;
  align-items: center;
`;

const BotaoPaginacao = styled.button`
  cursor: pointer;
  background-color: transparent;

  img {
    width: 22px;
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const MensagemNaoEncontrada = styled.p`
  margin: 1rem 0 0 2rem;
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
    return (
      <MensagemNaoEncontrada>
        Nenhuma viagem encontrada para este filtro.
      </MensagemNaoEncontrada>
    );
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
            <img src={BtnPagLft}></img>
          </BotaoPaginacao>

          <BotaoPaginacao
            onClick={proximaPagina}
            disabled={paginaAtual === totalDePaginas}
          >
            <img src={BtnPagRgt}></img>
          </BotaoPaginacao>
        </PaginacaoContainer>
      )}
    </>
  );
}
