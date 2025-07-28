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
  gap: 1.5rem;
`;

interface DadosReservaClienteProps {
  title: string;
  clientName: string;
  telefone: string;
  erros: { [key: string]: string };
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

export function DadosReservaCliente({
  title,
  clientName,
  telefone,
  erros,
  onInputChange,
}: DadosReservaClienteProps) {
  return (
    <Container>
      <InputGroup>
        <SectionTitle>Dados da Reserva</SectionTitle>
        <Label htmlFor="title">Título da Reserva</Label>
        <Input
          id="title"
          name="title"
          type="text"
          placeholder="Título da Reserva"
          value={title}
          onChange={onInputChange}
          hasError={!!erros.title}
        />
        {erros.title && <ErrorMessage>{erros.title}</ErrorMessage>}
      </InputGroup>

      <InputGroup>
        <SectionTitle>Dados Cliente</SectionTitle>
        <Label htmlFor="clientName">Nome do Cliente</Label>
        <Input
          id="clientName"
          name="clientName"
          type="text"
          placeholder="Nome Cliente"
          value={clientName}
          onChange={onInputChange}
          hasError={!!erros.clientName}
        />
        {erros.clientName && <ErrorMessage>{erros.clientName}</ErrorMessage>}

        <Label htmlFor="telefone">Telefone do Cliente</Label>
        <Input
          id="telefone"
          name="telefone"
          type="text"
          placeholder="Telefone Cliente"
          value={telefone}
          onChange={onInputChange}
        />
      </InputGroup>
    </Container>
  );
}
