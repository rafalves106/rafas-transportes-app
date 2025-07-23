import React from "react";
import styled from "styled-components";
import {
  InputGroup,
  Label,
  Select,
  SectionTitle,
} from "../../../../components/ui/Form";
import { type Viagem } from "../../../../services/viagemService";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

interface StatusViagemProps {
  currentStatus: Viagem["status"]; // O status atual da viagem
  onStatusChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function StatusViagem({
  currentStatus,
  onStatusChange,
}: StatusViagemProps) {
  return (
    <Container>
      <InputGroup>
        <SectionTitle>Status da Viagem</SectionTitle>
        <Label htmlFor="status">Status</Label>
        <Select
          id="status"
          name="status"
          value={currentStatus}
          onChange={onStatusChange}
        >
          <option value="AGENDADA">Agendada</option>
          <option value="EM_CURSO">Em Curso</option>
          <option value="FINALIZADA">Finalizada</option>
          <option value="CANCELADA">Cancelada</option>
        </Select>
      </InputGroup>
    </Container>
  );
}
