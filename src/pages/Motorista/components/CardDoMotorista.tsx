import styled from "styled-components";
import { Link } from "react-router-dom";

import { CardTitle, CardHeader } from "../../../components/ui/Card";

import type { Driver } from "../../../services/motoristaService";
import type { Viagem } from "../../../services/viagemService";

const CnhInfoTag = styled.span<{ color: string; background: string }>`
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  color: ${(props) => props.color};
  background-color: ${(props) => props.background};
  margin-right: 0.5rem;
`;

const getCnhAlertStyles = (validadeCnh: string) => {
  const dataValidade = new Date(validadeCnh + "T00:00:00");
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const diffTime = dataValidade.getTime() - hoje.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return {
      text: "CNH VENCIDA",
      color: "#842029",
      background: "#f8d7da",
      order: 1,
    };
  } else if (diffDays <= 30) {
    return {
      text: `Vence em ${diffDays} dias`,
      color: "#842029",
      background: "#f8d7da",
      order: 2,
    };
  } else if (diffDays <= 60) {
    return {
      text: `Vence em ${diffDays} dias`,
      color: "#664d03",
      background: "#fff3cd",
      order: 3,
    };
  } else if (diffDays <= 90) {
    return {
      text: `Vence em ${diffDays} dias`,
      color: "#0f5132",
      background: "#d1e7dd",
      order: 4,
    };
  } else if (diffDays <= 180) {
    return {
      text: `Vence em ${diffDays} dias`,
      color: "#0c5460",
      background: "#d1ecf1",
      order: 5,
    };
  } else if (diffDays <= 360) {
    return {
      text: `Vence em ${diffDays} dias`,
      color: "#006400",
      background: "#e0ffe0",
      order: 6,
    };
  }
  return {
    text: `Vence em ${diffDays} dias`,
    color: "#495057",
    background: "#e9ecef",
    order: 7,
  };
};

const OnDutyContainer = styled.div`
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const OnDutyTitle = styled.strong`
  font-size: 0.8rem;
  color: var(--color-primary);
  text-transform: uppercase;
`;

const OnDutyText = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #495057;
`;

const CardContainer = styled(Link)`
  background-color: var(--color-cardBackground);
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

const formatarData = (dataString: string): string => {
  const data = new Date(dataString + "T00:00:00");

  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();

  return `${dia}/${mes}/${ano}`;
};

interface CardDoMotoristaProps {
  motorista: Driver;
  viagens: Viagem[];
}
export function CardDoMotorista({ motorista, viagens }: CardDoMotoristaProps) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const viagemAtual = viagens.find((viagem) => {
    const dataInicio = new Date(viagem.startDate + "T00:00:00");
    const dataFim = new Date(viagem.endDate + "T00:00:00");
    const motoristaNaViagem = viagem.motoristaNome === motorista.nome;
    const viagemEmAndamento = hoje >= dataInicio && hoje <= dataFim;

    return motoristaNaViagem && viagemEmAndamento;
  });
  const formatarStatus = (status: string) => {
    if (!status) return "Inativo";
    if (status === "DE_FERIAS") return "Férias";
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const statusFormatado = formatarStatus(motorista.status);

  const cnhAlert = getCnhAlertStyles(motorista.validadeCnh);

  return (
    <CardContainer to={`/motoristas/editar/${motorista.id}`}>
      <CardHeader
        style={{ flexDirection: "column", alignItems: "start", gap: "1rem" }}
      >
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <InfoTag status={statusFormatado}>{statusFormatado}</InfoTag>
          {cnhAlert && (
            <CnhInfoTag color={cnhAlert.color} background={cnhAlert.background}>
              {cnhAlert.text}
            </CnhInfoTag>
          )}
        </div>
        <CardTitle>{motorista.nome}</CardTitle>
      </CardHeader>
      <InfoText>
        Validade da CNH: {formatarData(motorista.validadeCnh)}
      </InfoText>
      <InfoText>Telefone: {motorista.telefone}</InfoText>
      {viagemAtual && (
        <OnDutyContainer>
          <OnDutyTitle>Em Serviço</OnDutyTitle>
          <OnDutyText>Viagem: {viagemAtual.title}</OnDutyText>
        </OnDutyContainer>
      )}
    </CardContainer>
  );
}
