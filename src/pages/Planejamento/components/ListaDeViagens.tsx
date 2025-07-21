import { useState, useEffect } from "react";
import type { Viagem } from "../../../services/viagemService";
import { CardDeViagem } from "./CardDeViagem";
import BtnPagLft from "../../../assets/Expand Arrow.png";
import BtnPagRgt from "../../../assets/Expand Arrow-right.png";

import {
  ListaContainer,
  PaginacaoContainer,
} from "../../../components/ui/Layout";

import { ErrorMessage } from "../../../components/ui/Form";

import { Button } from "../../../components/ui/Button";

interface ListaDeViagensProps {
  viagens: Viagem[];
}

export function ListaDeViagens({ viagens }: ListaDeViagensProps) {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const ITENS_POR_PAGINA = 6;

  // Reseta a página para 1 sempre que a lista de viagens muda (ex: filtro)
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
      <ErrorMessage>Nenhuma viagem encontrada para este filtro.</ErrorMessage>
    );
  }

  return (
    <>
      <ListaContainer>
        {viagensDaPagina.map((viagem) => (
          <CardDeViagem key={viagem.id} viagem={viagem} />
        ))}
      </ListaContainer>

      {totalDePaginas > 1 && (
        <PaginacaoContainer>
          <Button
            variant="secondary"
            onClick={paginaAnterior}
            disabled={paginaAtual === 1}
          >
            <img src={BtnPagLft} alt="Página Anterior" />
          </Button>

          <span>
            Página {paginaAtual} de {totalDePaginas}
          </span>

          <Button
            variant="secondary"
            onClick={proximaPagina}
            disabled={paginaAtual === totalDePaginas}
          >
            <img src={BtnPagRgt} alt="Próxima Página" />
          </Button>
        </PaginacaoContainer>
      )}
    </>
  );
}
