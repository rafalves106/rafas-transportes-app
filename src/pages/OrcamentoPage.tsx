import { useOutletContext } from "react-router-dom";
import styled from "styled-components";
import type { Orcamento } from "../data/orcamentosData";
import { ListaDeOrcamentos } from "./Calculadora/components/ListaDeOrcamentos";

const PageContainer = styled.div`
  padding: 0 2rem;
`;

interface AppContextType {
  orcamentos: Orcamento[];
}

export function OrcamentosPage() {
  const { orcamentos } = useOutletContext<AppContextType>();

  return (
    <PageContainer>
      <ListaDeOrcamentos orcamentos={orcamentos} />
    </PageContainer>
  );
}
