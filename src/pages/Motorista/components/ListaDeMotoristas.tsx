import { useState } from "react";
import type { Driver } from "../../../data/driversData";
import { CardDoMotorista } from "./CardDoMotorista";

import { Button } from "../../../components/ui/Button";

import {
  ListaContainer,
  PaginacaoContainer,
} from "../../../components/ui/Layout";

interface ListaDeMotoristasProps {
  motoristas: Driver[];
}

export function ListaDeMotoristas({ motoristas }: ListaDeMotoristasProps) {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const ITENS_POR_PAGINA = 9;

  const totalPaginas = Math.ceil(motoristas.length / ITENS_POR_PAGINA);
  const indiceInicial = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const indiceFinal = paginaAtual * ITENS_POR_PAGINA;
  const motoristasDaPagina = motoristas.slice(indiceInicial, indiceFinal);

  const proximaPagina = () => {
    if (paginaAtual < totalPaginas) setPaginaAtual(paginaAtual + 1);
  };

  const paginaAnterior = () => {
    if (paginaAtual > 1) setPaginaAtual(paginaAtual - 1);
  };

  return (
    <>
      <ListaContainer>
        {motoristasDaPagina.map((motorista) => (
          <CardDoMotorista key={motorista.id} motorista={motorista} />
        ))}
      </ListaContainer>
      {totalPaginas > 1 && (
        <PaginacaoContainer>
          <Button
            variant="secondary"
            onClick={paginaAnterior}
            disabled={paginaAtual === 1}
          >
            Anterior
          </Button>
          <span>
            Página {paginaAtual} de {totalPaginas}
          </span>
          <Button
            variant="secondary"
            onClick={proximaPagina}
            disabled={paginaAtual === totalPaginas}
          >
            Próxima
          </Button>
        </PaginacaoContainer>
      )}
    </>
  );
}
