import styled from "styled-components";
import { format } from "date-fns";
import type { Trip } from "../../../data/tripsData";
import { vehiclesData } from "../../../data/vehiclesData";
import { driversData } from "../../../data/driversData";

import {
  CardContainer,
  CardHeader,
  CardTitle,
  DetailsLink,
} from "../../../components/ui/Card";
import { Label } from "../../../components/ui/Form";

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InfoTag = styled.span`
  background-color: var(--cor-secundaria);
  color: var(--cor-textos-infos);
  font-size: 0.8rem;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 20px;
`;

const Description = styled.p`
  font-size: 0.7rem;
  color: var(--cor-textos);
  font-weight: 500;
  line-height: 1.4;
  margin: 0.25rem 0 0.75rem 0;
`;

interface CardDeViagemProps {
  trip: Trip;
}

export function CardDeViagem({ trip }: CardDeViagemProps) {
  const veiculo = vehiclesData.find((v) => v.id === trip.vehicleId);
  const motorista = driversData.find((d) => d.id === trip.driverId);

  return (
    <CardContainer>
      <CardHeader>
        <CardTitle>
          {trip.title} | R$
          {trip.value.toFixed(2)}
        </CardTitle>
        <DetailsLink to={`/editar/${trip.id}`}>Detalhes</DetailsLink>
      </CardHeader>

      <div>
        <InfoRow>
          <Label>Início</Label>
          <InfoTag>
            {format(new Date(trip.startDate + "T00:00"), "dd/MM/yyyy")}
          </InfoTag>
          <InfoTag>{trip.startTime}</InfoTag>
        </InfoRow>
        <Description>{trip.startLocation}</Description>
      </div>

      <div>
        <InfoRow>
          <Label>Final</Label>
          <InfoTag>
            {format(new Date(trip.endDate + "T00:00"), "dd/MM/yyyy")}
          </InfoTag>
          <InfoTag>{trip.endTime}</InfoTag>
        </InfoRow>
        <Description>{trip.endLocation}</Description>
      </div>

      <InfoRow style={{ justifyContent: "space-between" }}>
        <InfoTag>{veiculo ? `${veiculo.plate}` : "N/A"}</InfoTag>
        <InfoTag>{motorista ? motorista.name : "N/A"}</InfoTag>
      </InfoRow>
    </CardContainer>
  );
}
