import styled from "styled-components";
import { format } from "date-fns";
import type { Trip } from "../../../data/TripsData";

const CardContainer = styled.div`
  max-width: 20rem;
  background-color: var(--cor-de-fundo-cards);
  border-radius: 8px;
  padding: 11px;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-weight: 600;
  color: var(--cor-titulos);
  font-size: 16px;
  margin-bottom: 8px;
`;

const CardInfoContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const CardInfoTitle = styled.p`
  color: var(--cor-titulos-secundaria);
  font-size: 12px;
  font-weight: 600;
  margin-right: 16px;
`;

const CardInfoDate = styled.span`
  background-color: var(--cor-secundaria);
  color: var(--cor-textos-infos);
  font-size: 12px;
  font-weight: 500;
  padding: 0px 6px;
  border-radius: 20px;
  margin-right: 8px;
`;

const CardInfoTime = styled.span`
  background-color: var(--cor-primaria);
  color: var(--cor-secundaria);
  font-size: 12px;
  font-weight: 500;
  padding: 0px 6px;
  border-radius: 20px;
`;

const CardInfoDesc = styled.p`
  font-size: 10px;
  color: var(--cor-textos);
  font-weight: 500;
  margin-bottom: 8px;
`;

const CardContainerPrice = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const CardInfoPriceTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: var(--cor-titulos);
  margin: 0;
`;

const CardInfoPrice = styled.span`
  background-color: var(--cor-secundaria);
  color: var(--cor-textos-infos);
  font-size: 12px;
  font-weight: 600;
  padding: 0px 6px;
  border-radius: 20px;
`;

interface CardDeViagemProps {
  trip: Trip;
}

export function CardDeViagem({ trip }: CardDeViagemProps) {
  return (
    <CardContainer className="trip-card">
      <CardTitle>{trip.title}</CardTitle>

      <CardInfoContainer>
        <CardInfoTitle>Início</CardInfoTitle>
        <CardInfoDate>
          {format(new Date(trip.startDate + "T00:00"), "dd/MM/yyyy")}
        </CardInfoDate>
        <CardInfoTime>{trip.startTime}</CardInfoTime>
      </CardInfoContainer>
      <CardInfoDesc>{trip.startLocation}</CardInfoDesc>

      <CardInfoContainer>
        <CardInfoTitle>Final</CardInfoTitle>
        <CardInfoDate>
          {format(new Date(trip.endDate + "T00:00"), "dd/MM/yyyy")}
        </CardInfoDate>
        <CardInfoTime>{trip.endTime}</CardInfoTime>
      </CardInfoContainer>
      <CardInfoDesc>{trip.endLocation}</CardInfoDesc>

      <CardContainerPrice>
        <CardInfoPriceTitle>Valor do Serviço</CardInfoPriceTitle>
        <CardInfoPrice>R$ {trip.value.toFixed(2)}</CardInfoPrice>
      </CardContainerPrice>
    </CardContainer>
  );
}
