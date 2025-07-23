import React from "react";
import styled from "styled-components";
import {
  InputGroup,
  Label,
  Input,
  ErrorMessage,
  Textarea,
  SectionTitle,
} from "../../../../components/ui/Form";
import { InputRow } from "../../../../components/ui/Layout";
import { type TipoViagemEnum } from "../../../../services/viagemService";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

interface PercursoViagemProps {
  startDate: string;
  startTime: string;
  startLocation: string;
  endDate: string;
  endTime: string;
  endLocation: string;
  tipoViagem: TipoViagemEnum; // Para a lógica de mostraInfoFim
  erros: { [key: string]: string };
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

export function PercursoViagem({
  startDate,
  startTime,
  startLocation,
  endDate,
  endTime,
  endLocation,
  tipoViagem,
  erros,
  onInputChange,
}: PercursoViagemProps) {
  const mostraPercursoIda = [
    "IDA_E_VOLTA_MG",
    "SOMENTE_IDA_MG",
    "IDA_E_VOLTA_FORA_MG",
    "SOMENTE_IDA_FORA_MG",
    "FRETAMENTO_AEROPORTO",
  ].includes(tipoViagem);

  const mostraPercursoVolta = [
    "IDA_E_VOLTA_MG",
    "IDA_E_VOLTA_FORA_MG",
    "FRETAMENTO_AEROPORTO",
  ].includes(tipoViagem);

  // Este componente só será renderizado se !isRota for true no pai.
  // Então, mostraPercursoIda e mostraPercursoVolta serão usados para controlar
  // a exibição dentro deste componente.

  return (
    <Container>
      {mostraPercursoIda && ( // Envolve todo o percurso de ida
        <>
          <SectionTitle>Percurso de Ida</SectionTitle>
          <InputRow>
            <InputGroup>
              <Label htmlFor="startDate">Data de Início</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={startDate}
                onChange={onInputChange}
                hasError={!!erros.startDate}
              />
              {erros.startDate && (
                <ErrorMessage>{erros.startDate}</ErrorMessage>
              )}
            </InputGroup>
            <InputGroup>
              <Label htmlFor="startTime">Hora de Saída</Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                value={startTime}
                onChange={onInputChange}
                hasError={!!erros.startTime}
              />
              {erros.startTime && (
                <ErrorMessage>{erros.startTime}</ErrorMessage>
              )}
            </InputGroup>
          </InputRow>
          <InputGroup>
            <Label htmlFor="startLocation">Local de Início</Label>
            <Textarea
              id="startLocation"
              name="startLocation"
              placeholder="Detalhes do local de início"
              value={startLocation}
              onChange={onInputChange}
            />
          </InputGroup>
        </>
      )}

      {mostraPercursoVolta && ( // Envolve todo o percurso de volta
        <>
          <SectionTitle>Percurso de Volta</SectionTitle>
          <InputRow>
            <InputGroup>
              <Label htmlFor="endDate">Data de Retorno</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={endDate}
                onChange={onInputChange}
                hasError={!!erros.endDate}
              />
              {erros.endDate && <ErrorMessage>{erros.endDate}</ErrorMessage>}
            </InputGroup>
            <InputGroup>
              <Label htmlFor="endTime">Hora de Volta</Label>
              <Input
                id="endTime"
                name="endTime"
                type="time"
                value={endTime}
                onChange={onInputChange}
                hasError={!!erros.endTime}
              />
              {erros.endTime && <ErrorMessage>{erros.endTime}</ErrorMessage>}
            </InputGroup>
          </InputRow>
          <InputGroup>
            <Label htmlFor="endLocation">Local de Fim</Label>
            <Textarea
              id="endLocation"
              name="endLocation"
              placeholder="Detalhes do local de fim"
              value={endLocation}
              onChange={onInputChange}
            />
          </InputGroup>
        </>
      )}
    </Container>
  );
}
