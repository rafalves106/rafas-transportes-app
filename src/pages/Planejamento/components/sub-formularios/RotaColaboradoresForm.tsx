import React from "react";
import styled from "styled-components";
import { Button } from "../../../../components/ui/Button";
import {
  InputGroup,
  Label,
  Input,
  Select,
  ErrorMessage,
  SectionTitle,
} from "../../../../components/ui/Form";
import { InputRow } from "../../../../components/ui/Layout";
import { type Vehicle } from "../../../../services/veiculoService";
import { type Driver } from "../../../../services/motoristaService";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const RotaVeiculoBloco = styled.div`
  border-left: 3px solid #dee2e6;
  padding-left: 1rem;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RotaHorarioContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LabelContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

// Tipo para um item individual da rota dentro do estado do formulário pai
interface ItemRotaFormState {
  veiculoId: string;
  motoristaId: string;
  horarioInicio: string; // Direto, não um array
  horarioFim: string; // Direto, não um array
}

interface RotaColaboradoresFormProps {
  rota: ItemRotaFormState[];
  listaVeiculos: Vehicle[];
  listaMotoristas: Driver[];
  erros: { [key: string]: string };
  adicionarVeiculoRota: () => void;
  removerVeiculoRota: (index: number) => void;
  handleRotaVeiculoChange: (
    index: number,
    e: React.ChangeEvent<HTMLSelectElement>
  ) => void;
  handleRotaMotoristaChange: (
    index: number,
    e: React.ChangeEvent<HTMLSelectElement>
  ) => void;
  // handleHorarioChange precisa ser ajustado para manipular campos diretos
  handleHorarioChange: (
    veiculoIndex: number,
    field: "horarioInicio" | "horarioFim", // Agora o 'field' é direto
    value: string
  ) => void;

  // Campos de período geral da rota, passados para cá
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function RotaColaboradoresForm({
  rota,
  listaVeiculos,
  listaMotoristas,
  erros,
  adicionarVeiculoRota,
  removerVeiculoRota,
  handleRotaVeiculoChange,
  handleRotaMotoristaChange,
  handleHorarioChange, // Função de manipulação de horário para campos diretos
  startDate,
  startTime,
  endDate,
  endTime,
  onInputChange,
}: RotaColaboradoresFormProps) {
  return (
    <Container>
      {/* Período da Rota */}
      <SectionTitle>Período da Rota</SectionTitle>
      <InputRow>
        <InputGroup>
          <Label htmlFor="startDate">Data de Início da Rota</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            value={startDate}
            onChange={onInputChange}
            hasError={!!erros.startDate}
          />
          {erros.startDate && <ErrorMessage>{erros.startDate}</ErrorMessage>}
        </InputGroup>
        <InputGroup>
          <Label htmlFor="startTime">Hora de Início da Rota</Label>
          <Input
            id="startTime"
            name="startTime"
            type="time"
            value={startTime}
            onChange={onInputChange}
            hasError={!!erros.startTime}
          />
          {erros.startTime && <ErrorMessage>{erros.startTime}</ErrorMessage>}
        </InputGroup>
      </InputRow>
      <InputRow>
        <InputGroup>
          <Label htmlFor="endDate">Data de Fim da Rota</Label>
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
          <Label htmlFor="endTime">Hora de Fim da Rota</Label>
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

      {/* Veículos e Horários da Rota */}
      <SectionTitle style={{ marginTop: "1.5rem" }}>
        Veículos e Horários da Rota
      </SectionTitle>

      {rota.map((itemRota, veiculoIndex) => (
        <RotaVeiculoBloco key={veiculoIndex}>
          <LabelContainer>
            <Label>Item da Rota {veiculoIndex + 1}</Label>
            {veiculoIndex > 0 && (
              <Button
                variant="danger"
                type="button"
                onClick={() => removerVeiculoRota(veiculoIndex)}
              >
                &times;
              </Button>
            )}
          </LabelContainer>
          <InputRow>
            <InputGroup>
              <Label htmlFor={`veiculo-rota-${veiculoIndex}`}>Veículo</Label>
              <Select
                id={`veiculo-rota-${veiculoIndex}`}
                value={itemRota.veiculoId}
                onChange={(e) => handleRotaVeiculoChange(veiculoIndex, e)}
                hasError={!!erros[`rota[${veiculoIndex}].veiculoId`]}
              >
                <option value="">Selecione</option>
                {listaVeiculos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.model} ({v.plate})
                  </option>
                ))}
              </Select>
              {erros[`rota[${veiculoIndex}].veiculoId`] && (
                <ErrorMessage>
                  {erros[`rota[${veiculoIndex}].veiculoId`]}
                </ErrorMessage>
              )}
            </InputGroup>

            <InputGroup>
              <Label htmlFor={`motorista-rota-${veiculoIndex}`}>
                Motorista
              </Label>
              <Select
                id={`motorista-rota-${veiculoIndex}`}
                value={itemRota.motoristaId}
                onChange={(e) => handleRotaMotoristaChange(veiculoIndex, e)}
                hasError={!!erros[`rota[${veiculoIndex}].motoristaId`]}
              >
                <option value="">Selecione</option>
                {listaMotoristas.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nome}
                  </option>
                ))}
              </Select>
              {erros[`rota[${veiculoIndex}].motoristaId`] && (
                <ErrorMessage>
                  {erros[`rota[${veiculoIndex}].motoristaId`]}
                </ErrorMessage>
              )}
            </InputGroup>
          </InputRow>
          <Label>Horário do Veículo</Label>{" "}
          {/* Corrigido para "Horário" (singular) */}
          <RotaHorarioContainer>
            <InputGroup>
              <Label
                htmlFor={`inicio-${veiculoIndex}`} // Remover horarioIndex, pois é um par único
              >
                Início
              </Label>
              <Input
                id={`inicio-${veiculoIndex}`}
                type="time"
                name="horarioInicio" // Nome do campo
                value={itemRota.horarioInicio} // Acessa diretamente
                onChange={(e) =>
                  handleHorarioChange(
                    veiculoIndex,
                    "horarioInicio",
                    e.target.value
                  )
                }
                hasError={!!erros[`rota[${veiculoIndex}].horarioInicio`]}
              />
              {erros[`rota[${veiculoIndex}].horarioInicio`] && (
                <ErrorMessage>
                  {erros[`rota[${veiculoIndex}].horarioInicio`]}
                </ErrorMessage>
              )}
            </InputGroup>
            <InputGroup>
              <Label htmlFor={`fim-${veiculoIndex}`}>Fim</Label>
              <Input
                id={`fim-${veiculoIndex}`}
                type="time"
                name="horarioFim" // Nome do campo
                value={itemRota.horarioFim} // Acessa diretamente
                onChange={(e) =>
                  handleHorarioChange(
                    veiculoIndex,
                    "horarioFim",
                    e.target.value
                  )
                }
                hasError={!!erros[`rota[${veiculoIndex}].horarioFim`]}
              />
              {erros[`rota[${veiculoIndex}].horarioFim`] && (
                <ErrorMessage>
                  {erros[`rota[${veiculoIndex}].horarioFim`]}
                </ErrorMessage>
              )}
            </InputGroup>
            {/* REMOVER botão de remover horário, pois só tem um par */}
            {/* REMOVER erro de horarios[] */}
          </RotaHorarioContainer>
          {/* REMOVER botão "+ Adicionar Horário" */}
        </RotaVeiculoBloco>
      ))}
      {erros.rota && <ErrorMessage>{erros.rota}</ErrorMessage>}
      <Button
        variant="primary"
        type="button"
        onClick={adicionarVeiculoRota}
        style={{ marginTop: "1rem" }}
      >
        + Adicionar Veículo à Rota
      </Button>
    </Container>
  );
}
