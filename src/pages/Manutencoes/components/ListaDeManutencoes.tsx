import styled from "styled-components";
import { Link } from "react-router-dom";
import { vehiclesData } from "../../../data/vehiclesData";
import type { Maintenance } from "../../../data/maintenanceData";

import { ListaContainer, GroupContainer } from "../../../components/ui/Layout";

import { CardTitle } from "../../../components/ui/Card";

const MaintenanceCard = styled(Link)`
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 0.5rem;
  text-decoration: none;
  color: inherit;
`;

interface ListaDeManutencoesProps {
  manutencoes: Maintenance[];
}

export function ListaDeManutencoes({ manutencoes }: ListaDeManutencoesProps) {
  const manutencoesAgrupadas = manutencoes.reduce((acc, manutencao) => {
    (acc[manutencao.vehicleId] = acc[manutencao.vehicleId] || []).push(
      manutencao
    );
    return acc;
  }, {} as Record<number, Maintenance[]>);

  return (
    <ListaContainer>
      {Object.entries(manutencoesAgrupadas).map(([vehicleId, mnts]) => {
        const veiculo = vehiclesData.find((v) => v.id === parseInt(vehicleId));
        return (
          <GroupContainer key={vehicleId}>
            <CardTitle>
              {veiculo
                ? `${veiculo.model} (${veiculo.plate})`
                : "Veículo desconhecido"}
            </CardTitle>
            {mnts.map((manutencao) => (
              <MaintenanceCard
                key={manutencao.id}
                to={`/manutencoes/editar/${manutencao.id}`}
              >
                <span>{manutencao.title}</span>
                <span>
                  {new Date(manutencao.date + "T00:00").toLocaleDateString(
                    "pt-BR"
                  )}
                </span>
              </MaintenanceCard>
            ))}
          </GroupContainer>
        );
      })}
    </ListaContainer>
  );
}
