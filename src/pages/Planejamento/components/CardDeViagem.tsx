import styled from "styled-components";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import type { Viagem } from "../../../services/viagemService";

import { CardTitle } from "../../../components/ui/Card";

const CardContainer = styled(Link)`
  background-color: var(--color-cardBackground);
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

const InfoText = styled.p`
  margin: 0;
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 500;
`;

const InfoTag = styled.span<{ status: Viagem["status"] }>`
  background-color: var(--color-background);
  color: var(--color-secondaryTitle);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  background-color: ${(props) => {
    switch (props.status) {
      case "AGENDADA":
        return "#e0f7fa";
      case "EM_CURSO":
        return "#fff3cd";
      case "FINALIZADA":
        return "#d1e7dd";
      case "CANCELADA":
        return "#f8d7da";
      default:
        return "#e9ecef";
    }
  }};
  color: ${(props) => {
    switch (props.status) {
      case "AGENDADA":
        return "#00bcd4";
      case "EM_CURSO":
        return "#ffc107";
      case "FINALIZADA":
        return "#28a745";
      case "CANCELADA":
        return "#dc3545";
      default:
        return "#495057";
    }
  }};
`;

const InfoType = styled.span<{ tipo: Viagem["tipoViagem"] }>`
  background-color: ${(props) => {
    switch (props.tipo) {
      case "FRETAMENTO_AEROPORTO":
        return "#e6e0fa";
      case "IDA_E_VOLTA_MG":
        return "#d1e7dd";
      case "SOMENTE_IDA_MG":
        return "#f8d7da";
      case "IDA_E_VOLTA_FORA_MG":
        return "#fff3cd";
      case "SOMENTE_IDA_FORA_MG":
        return "#cfe2ff";
      default:
        return "#e9ecef";
    }
  }};
  color: ${(props) => {
    switch (props.tipo) {
      case "FRETAMENTO_AEROPORTO":
        return "#6f42c1";
      case "IDA_E_VOLTA_MG":
        return "#28a745";
      case "SOMENTE_IDA_MG":
        return "#dc3545";
      case "IDA_E_VOLTA_FORA_MG":
        return "#ffc107";
      case "SOMENTE_IDA_FORA_MG":
        return "#0d6efd";
      default:
        return "#495057";
    }
  }};
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
`;

const InfoPrice = styled.span<{ preco: Viagem["valor"] }>`
  background-color: var(--color-background);
  color: #00bcd4;
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

  const formatarStatusParaExibicao = (status: Viagem["status"]) => {
    switch (status) {
      case "AGENDADA":
        return "Agendada";
      case "EM_CURSO":
        return "Em Curso";
      case "FINALIZADA":
        return "Finalizada";
      case "CANCELADA":
        return "Cancelada";
      default:
        return status;
    }
  };

  const formatarTipoParaExibicao = (tipo: Viagem["tipoViagem"]) => {
    switch (tipo) {
      case "SOMENTE_IDA_FORA_MG":
        return "Somente Ida";
      case "IDA_E_VOLTA_FORA_MG":
        return "Ida e Volta";
      case "SOMENTE_IDA_MG":
        return "Somente Ida";
      case "IDA_E_VOLTA_MG":
        return "Ida e Volta";
      case "ROTA_COLABORADORES":
        return "Rota Colaboradores";
      default:
        return tipo;
    }
  };

  const formatarPrecoParaExibicao = (preco?: number) => {
    if (preco === undefined || preco === null) {
      return "R$ N/A";
    }
    return "R$ " + preco.toFixed(2).replace(".", ",");
  };

  const mostraInfoFim = ![
    "SOMENTE_IDA_MG",
    "SOMENTE_IDA_FORA_MG",
    "ROTA_COLABORADORES",
  ].includes(viagem.tipoViagem);

  return (
    <CardContainer to={`/editar/${viagem.id}`}>
      <div>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <InfoTag status={viagem.status}>
            {formatarStatusParaExibicao(viagem.status)}
          </InfoTag>
          <InfoType tipo={viagem.tipoViagem}>
            {formatarTipoParaExibicao(viagem.tipoViagem)}
          </InfoType>
          <InfoPrice preco={viagem.valor}>
            {formatarPrecoParaExibicao(viagem.valor)}
          </InfoPrice>
        </div>
        <CardTitle>{viagem.title}</CardTitle>
      </div>

      {viagem.tipoViagem === "ROTA_COLABORADORES" ? (
        <>
          <InfoText>**Rota de Colaboradores**</InfoText>
          <InfoText>
            Período: {formatarData(viagem.startDate || "")} às{" "}
            {viagem.startTime || ""} - {formatarData(viagem.endDate || "")} às{" "}
            {viagem.endTime || ""}
          </InfoText>
          <InfoText>
            Locais: {viagem.startLocation || ""} - {viagem.endLocation || ""}
          </InfoText>
        </>
      ) : (
        <>
          <InfoText>Veículo: {viagem.veiculoInfo || "N/A"}</InfoText>
          <InfoText>Motorista: {viagem.motoristaNome || "N/A"}</InfoText>
          <InfoText>
            Início: {formatarData(viagem.startDate || "")} às{" "}
            {viagem.startTime || ""} {viagem.startLocation || ""}
          </InfoText>
          {mostraInfoFim && (
            <InfoText>
              Fim: {formatarData(viagem.endDate || "")} às{" "}
              {viagem.endTime || ""}
              {viagem.endLocation || ""}
            </InfoText>
          )}
        </>
      )}
    </CardContainer>
  );
}
