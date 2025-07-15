import styled from "styled-components";
import type { Orcamento } from "../../services/orcamentoService";
import { CardDeOrcamento } from "./CardDeOrcamento";
import { ListaContainer } from "../../components/ui/Layout";

const SectionTitle = styled.h2`
  margin-top: 3rem;
  margin-bottom: 1rem;
  padding-left: 2rem;
`;

interface ListaDeOrcamentosProps {
  orcamentos: Orcamento[];
}

export function ListaDeOrcamentos({ orcamentos }: ListaDeOrcamentosProps) {
  if (orcamentos.length === 0) {
    return null;
  }

  const orcamentosOrdenados = [...orcamentos].reverse();

  return (
    <div>
      <SectionTitle>Últimos Orçamentos Salvos</SectionTitle>
      <ListaContainer>
        {orcamentosOrdenados.map((orcamento) => (
          <CardDeOrcamento key={orcamento.id} orcamento={orcamento} />
        ))}
      </ListaContainer>
    </div>
  );
}
