import styled from "styled-components";
import { Link } from "react-router-dom";

import { CardTitle, CardHeader } from "../../../components/ui/Card";

import type { Driver } from "../../../services/motoristaService";
import type { Viagem } from "../../../services/viagemService";

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

  return (
    <CardContainer to={`/motoristas/editar/${motorista.id}`}>
      <CardHeader>
        <CardTitle>{motorista.nome}</CardTitle>
        <InfoTag status={statusFormatado}>{statusFormatado}</InfoTag>{" "}
      </CardHeader>
      <InfoText>Validade da CNH: {motorista.validadeCnh}</InfoText>
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
