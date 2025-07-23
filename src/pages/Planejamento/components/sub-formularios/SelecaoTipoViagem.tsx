import React from "react";
import styled from "styled-components";
import {
  InputGroup,
  Label,
  Select,
  SectionTitle,
} from "../../../../components/ui/Form";
import { type TipoViagemEnum } from "../../../../services/viagemService";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

interface SelecaoTipoViagemProps {
  tipoViagem: TipoViagemEnum;
  onInputChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function SelecaoTipoViagem({
  tipoViagem,
  onInputChange,
}: SelecaoTipoViagemProps) {
  return (
    <Container>
      <InputGroup>
        <SectionTitle>Tipo de Viagem</SectionTitle>
        <Label htmlFor="tipoViagem">Selecione o Tipo de Viagem</Label>
        <Select
          id="tipoViagem"
          name="tipoViagem"
          value={tipoViagem}
          onChange={onInputChange}
        >
          <option value="FRETAMENTO_AEROPORTO">Fretamento Aeroporto</option>
          <option value="IDA_E_VOLTA_MG">Viagem Ida e Volta - MG</option>
          <option value="SOMENTE_IDA_MG">Viagem Somente Ida - MG</option>
          <option value="IDA_E_VOLTA_FORA_MG">
            Viagem Ida e Volta - Fora de MG
          </option>
          <option value="SOMENTE_IDA_FORA_MG">
            Viagem Somente Ida - Fora de MG
          </option>
          <option value="ROTA_COLABORADORES">Rota de Colaboradores</option>
        </Select>
      </InputGroup>
    </Container>
  );
}
