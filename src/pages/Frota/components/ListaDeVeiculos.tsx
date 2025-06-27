import { useState } from "react";
import styled from "styled-components";
import type { Vehicle } from "../../../data/vehiclesData";
import { CardDeVeiculo } from "./CardDeVeiculo";
import BtnPagLft from "../../../assets/Expand Arrow.png";
import BtnPagRgt from "../../../assets/Expand Arrow-right.png";

const ListaContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  column-gap: 2rem;
  gap: 1.5rem;
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

interface ListaDeVeiculosProps {
  veiculos: Vehicle[];
}

export function ListaDeVeiculos({ veiculos }: ListaDeVeiculosProps) {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const ITENS_POR_PAGINA = 9;

  const totalPaginas = Math.ceil(veiculos.length / ITENS_POR_PAGINA);
  const indiceInicial = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const indiceFinal = paginaAtual * ITENS_POR_PAGINA;
  const veiculosDaPagina = veiculos.slice(indiceInicial, indiceFinal);

  const proximaPagina = () => {
    if (paginaAtual < totalPaginas) {
      setPaginaAtual(paginaAtual + 1);
    }
  };

  const paginaAnterior = () => {
    if (paginaAtual > 1) {
      setPaginaAtual(paginaAtual - 1);
    }
  };

  if (veiculos.length === 0) {
    return (
      <MensagemNaoEncontrada>
        Nenhuma viagem encontrada para este filtro.
      </MensagemNaoEncontrada>
    );
  }

  return (
    <>
      <ListaContainer>
        {veiculosDaPagina.map((veiculo) => (
          <CardDeVeiculo key={veiculo.id} veiculo={veiculo} />
        ))}
      </ListaContainer>

      {totalPaginas > 1 && (
        <PaginacaoContainer>
          <BotaoPaginacao onClick={paginaAnterior} disabled={paginaAtual === 1}>
            <img src={BtnPagLft}></img>
          </BotaoPaginacao>

          <BotaoPaginacao
            onClick={proximaPagina}
            disabled={paginaAtual === totalPaginas}
          >
            <img src={BtnPagRgt}></img>
          </BotaoPaginacao>
        </PaginacaoContainer>
      )}
    </>
  );
}
