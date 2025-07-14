import styled from "styled-components";
import type { Vehicle } from "../../../services/veiculoService";

import {
  CardContainer,
  CardHeader,
  CardTitle,
  DetailsLink,
} from "../../../components/ui/Card";

const getStatusStyles = (status: string) => {
  switch (status) {
    case "Ativo":
      return { background: "#d1e7dd", color: "#0f5132" };
    case "Em Manutenção":
      return { background: "#fff3cd", color: "#664d03" };
    case "Inativo":
      return { background: "#e9ecef", color: "#495057" };
    default:
      return { background: "#e9ecef", color: "#495057" };
  }
};

const InfoTag = styled.span<{ status: string }>`
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  color: ${(props) => getStatusStyles(props.status).color};
  background-color: ${(props) => getStatusStyles(props.status).background};
`;

interface CardDeVeiculoProps {
  veiculo: Vehicle;
}

export function CardDeVeiculo({ veiculo }: CardDeVeiculoProps) {
  const formatarStatus = (status: string) => {
    if (!status) return "Inativo";
    if (status === "EM_MANUTENCAO") return "Em Manutenção";
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const statusFormatado = formatarStatus(veiculo.status);

  return (
    <CardContainer>
      <CardHeader>
        <CardTitle>{veiculo.model}</CardTitle>
        <InfoTag status={statusFormatado}>{statusFormatado}</InfoTag>
      </CardHeader>
      <p style={{ margin: 0, color: "#6c757d" }}>Placa: {veiculo.plate}</p>
      <DetailsLink to={`/frota/editar/${veiculo.id}`}>Detalhes</DetailsLink>
    </CardContainer>
  );
}
