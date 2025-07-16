import styled from "styled-components";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import type { Viagem } from "../../../services/viagemService";

import { CardHeader, CardTitle } from "../../../components/ui/Card";

const CardContainer = styled(Link)`
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const InfoText = styled.p`
  margin: 0;
  color: #495057;
  font-size: 0.9rem;
  font-weight: 500;
`;

const InfoTag = styled.span`
  background-color: #e9ecef;
  color: #495057;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
`;

interface CardDeViagemProps {
  viagem: Viagem;
}

export function CardDeViagem({ viagem }: CardDeViagemProps) {
  const formatarData = (dataString: string) => {
    try {
      return format(new Date(dataString + "T00:00:00"), "dd/MM/yyyy");
    } catch {
      return "Data inválida";
    }
  };

  return (
    <CardContainer to={`/editar/${viagem.id}`}>
      <CardHeader>
        <CardTitle>{viagem.title}</CardTitle>
        <InfoTag>{viagem.status}</InfoTag>
      </CardHeader>

      <InfoText>Veículo: {viagem.veiculoInfo}</InfoText>
      <InfoText>Motorista: {viagem.motoristaNome}</InfoText>

      <InfoRow>
        <InfoText>
          Início: {formatarData(viagem.startDate)} às {viagem.startTime}
        </InfoText>
        <InfoText>Saída {viagem.startLocation}</InfoText>
        <InfoText>
          Fim: {formatarData(viagem.endDate)} às {viagem.endTime}
        </InfoText>
        <InfoText>Destino {viagem.endLocation}</InfoText>
      </InfoRow>
    </CardContainer>
  );
}
