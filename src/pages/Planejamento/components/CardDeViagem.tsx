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

// Adaptação para exibir o status do enum (em maiúsculas) de forma legível
const InfoTag = styled.span<{ status: Viagem["status"] }>`
  // <--- ADICIONE A TIPAGEM AQUI
  background-color: #e9ecef;
  color: #495057;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  /* Agora você pode usar props.status aqui se quiser estilos condicionais, por exemplo: */
  background-color: ${(props) => {
    switch (props.status) {
      case "AGENDADA":
        return "#e0f7fa"; // Light blue
      case "EM_CURSO":
        return "#fff3cd"; // Light yellow
      case "FINALIZADA":
        return "#d1e7dd"; // Light green
      case "CANCELADA":
        return "#f8d7da"; // Light red
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

const RotaItemText = styled.p`
  margin: 0;
  color: #6c757d;
  font-size: 0.85rem;
  padding-left: 0.5rem;
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

  // Função para formatar o status do enum para exibição amigável
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
        return status; // Retorna o próprio valor se for desconhecido
    }
  };

  const mostraInfoFim = ![
    "SOMENTE_IDA_MG",
    "SOMENTE_IDA_FORA_MG",
    "ROTA_COLABORADORES", // Adicione outros tipos de viagem que não tenham um "fim" definido
  ].includes(viagem.tipoViagem);

  return (
    <CardContainer to={`/editar/${viagem.id}`}>
      <CardHeader>
        <CardTitle>{viagem.title}</CardTitle>
        <InfoTag status={viagem.status}>
          {formatarStatusParaExibicao(viagem.status)}
        </InfoTag>
      </CardHeader>

      {viagem.tipoViagem === "ROTA_COLABORADORES" ? (
        <>
          {viagem.itensRota && viagem.itensRota.length > 0 ? (
            viagem.itensRota.map((item, index) => (
              <RotaItemText key={index}>
                {item.veiculoInfo} | {item.motoristaNome} | {item.horarioInicio}{" "}
                - {item.horarioFim}
              </RotaItemText>
            ))
          ) : (
            <RotaItemText>
              Nenhum veículo/motorista definido para esta rota.
            </RotaItemText>
          )}
        </>
      ) : (
        <>
          <InfoText>Veículo: {viagem.veiculoInfo}</InfoText>
          <InfoText>Motorista: {viagem.motoristaNome}</InfoText>

          <InfoRow>
            <InfoText>
              Início: {formatarData(viagem.startDate)} às {viagem.startTime}{" "}
              {viagem.startLocation}
            </InfoText>
            {mostraInfoFim && (
              <InfoText>
                Fim: {formatarData(viagem.endDate)} às {viagem.endTime}{" "}
                {viagem.endLocation}
              </InfoText>
            )}
          </InfoRow>
        </>
      )}
    </CardContainer>
  );
}
