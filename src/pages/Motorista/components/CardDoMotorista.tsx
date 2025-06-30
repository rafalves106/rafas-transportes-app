import styled from "styled-components";
import { Link } from "react-router-dom";
import type { Driver } from "../../../data/driversData";

import { tripsData } from "../../../data/tripsData";
import { vehiclesData } from "../../../data/vehiclesData";

import { CardTitle, CardHeader } from "../../../components/ui/Card";

const OnDutyContainer = styled.div`
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const OnDutyTitle = styled.strong`
  font-size: 0.8rem;
  color: var(--cor-primaria);
  text-transform: uppercase;
`;

const OnDutyText = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #495057;
`;

const CardContainer = styled(Link)`
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const InfoTag = styled.span<{ status: string }>`
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  color: ${(props) =>
    props.status === "Ativo"
      ? "#0f5132"
      : props.status === "Férias"
      ? "#664d03"
      : "#495057"};
  background-color: ${(props) =>
    props.status === "Ativo"
      ? "#d1e7dd"
      : props.status === "Férias"
      ? "#fff3cd"
      : "#e9ecef"};
`;
const InfoText = styled.p`
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
`;

interface CardDoMotoristaProps {
  motorista: Driver;
}

export function CardDoMotorista({ motorista }: CardDoMotoristaProps) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const viagemAtual = tripsData.find((trip) => {
    const dataInicio = new Date(trip.startDate + "T00:00");
    const dataFim = new Date(trip.endDate + "T00:00");
    const motoristaNaViagem = trip.driverId === motorista.id;
    const viagemEmAndamento = hoje >= dataInicio && hoje <= dataFim;

    return motoristaNaViagem && viagemEmAndamento;
  });

  const veiculoAtual = viagemAtual
    ? vehiclesData.find((v) => v.id === viagemAtual.vehicleId)
    : null;

  return (
    <CardContainer to={`/motoristas/editar/${motorista.id}`}>
      <CardHeader>
        <CardTitle>{motorista.name}</CardTitle>
        <InfoTag status={motorista.status}>{motorista.status}</InfoTag>
      </CardHeader>
      <InfoText>CNH: {motorista.licenseNumber}</InfoText>
      <InfoText>Telefone: {motorista.phone}</InfoText>

      {viagemAtual && (
        <OnDutyContainer>
          <OnDutyTitle>Em Serviço</OnDutyTitle>
          <OnDutyText>Viagem: {viagemAtual.title}</OnDutyText>
          {veiculoAtual && (
            <OnDutyText>
              Veículo: {veiculoAtual.model} ({veiculoAtual.plate})
            </OnDutyText>
          )}
        </OnDutyContainer>
      )}
    </CardContainer>
  );
}
