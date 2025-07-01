import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import type { Orcamento } from "../../../data/orcamentosData";
import {
  CardContainer,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";

const InfoText = styled.p`
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: #495057;
`;

const TotalText = styled.strong`
  display: block;
  margin-top: 0.75rem;
  font-size: 1.1rem;
`;

interface CardDeOrcamentoProps {
  orcamento: Orcamento;
}

export function CardDeOrcamento({ orcamento }: CardDeOrcamentoProps) {
  const navigate = useNavigate();

  const handleConverter = () => {
    navigate("/novo", { state: { dadosDoOrcamento: orcamento.formData } });
  };
  return (
    <CardContainer>
      <CardHeader>
        <CardTitle>{orcamento.title}</CardTitle>
        <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>
          {orcamento.status}
        </span>
      </CardHeader>
      <InfoText>Cliente: {orcamento.clientName}</InfoText>
      <InfoText>De: {orcamento.formData.origem}</InfoText>
      <InfoText>Para: {orcamento.formData.destino}</InfoText>
      <TotalText>Valor Total: R$ {orcamento.valorTotal.toFixed(2)}</TotalText>
      <Button
        variant="secondary"
        onClick={handleConverter}
        style={{ marginTop: "1rem", width: "100%" }}
      >
        Converter em Viagem
      </Button>
    </CardContainer>
  );
}
