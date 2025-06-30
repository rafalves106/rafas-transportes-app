import { useState } from "react";
import type { Vehicle } from "../../../data/vehiclesData";
import { CardDeVeiculo } from "./CardDeVeiculo";
import BtnPagLft from "../../../assets/Expand Arrow.png";
import BtnPagRgt from "../../../assets/Expand Arrow-right.png";

import {
  ListaContainer,
  PaginacaoContainer,
} from "../../../components/ui/Layout";

import { BotaoPaginacao } from "../../../components/ui/Button";

import { ErrorMessage } from "../../../components/ui/Form";

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
      <ErrorMessage>Nenhuma viagem encontrada para este filtro.</ErrorMessage>
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
