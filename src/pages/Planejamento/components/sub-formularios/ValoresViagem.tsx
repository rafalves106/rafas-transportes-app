import React from "react";
import styled from "styled-components";
import {
  InputGroup,
  Label,
  Input,
  ErrorMessage,
  SectionTitle,
} from "../../../../components/ui/Form";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

interface ValoresViagemProps {
  valor: string;
  erros: { [key: string]: string };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ValoresViagem({
  valor,
  erros,
  onInputChange,
}: ValoresViagemProps) {
  return (
    <Container>
      <InputGroup>
        <SectionTitle>Valores</SectionTitle>
        <Label htmlFor="valor">Valor do Serviço (R$)</Label>
        <Input
          id="valor"
          name="valor"
          type="number"
          placeholder="R$ Valor do Serviço"
          value={valor}
          onChange={onInputChange}
          hasError={!!erros.valor}
        />
        {erros.valor && <ErrorMessage>{erros.valor}</ErrorMessage>}
      </InputGroup>
    </Container>
  );
}
