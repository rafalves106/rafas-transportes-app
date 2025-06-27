import styled from "styled-components";
import { Link } from "react-router-dom";
import type { Vehicle } from "../../../data/vehiclesData";

const CardContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
`;

const DetailsLink = styled(Link)`
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  color: var(--cor-primaria);
`;

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
  return (
    <CardContainer>
      <CardHeader>
        <CardTitle>{veiculo.model}</CardTitle>
        <InfoTag status={veiculo.status}>{veiculo.status}</InfoTag>
      </CardHeader>
      <p style={{ margin: 0, color: "#6c757d" }}>Placa: {veiculo.plate}</p>
      <DetailsLink to={`/frota/editar/${veiculo.id}`}>Detalhes</DetailsLink>
    </CardContainer>
  );
}
