import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import type { Orcamento } from "../../services/orcamentoService";
import { CardContainer, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

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
    navigate("/novo", {
      state: {
        dadosDoOrcamento: {
          origem: orcamento.origem,
          destino: orcamento.destino,
          nomeCliente: orcamento.nomeCliente,
          telefone: orcamento.telefone,
          distancia: orcamento.distancia,
          valorTotal: orcamento.valorTotal,
          paradas: orcamento.paradas,
          tipoViagemOrcamento: orcamento.tipoViagemOrcamento,
          descricaoIdaOrcamento: orcamento.descricaoIdaOrcamento,
          descricaoVoltaOrcamento: orcamento.descricaoVoltaOrcamento,
          textoGerado: orcamento.textoGerado,
        },
      },
    });
  };

  return (
    <CardContainer>
      <CardHeader>
        <CardTitle>{orcamento.nomeCliente}</CardTitle>
      </CardHeader>
      <InfoText>De: {orcamento.origem}</InfoText>
      {orcamento.paradas && orcamento.paradas.trim() !== "" && (
        <InfoText>Paradas: {orcamento.paradas}</InfoText>
      )}
      <InfoText>Para: {orcamento.destino}</InfoText>
      <InfoText>Distância: {orcamento.distancia}</InfoText>
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
