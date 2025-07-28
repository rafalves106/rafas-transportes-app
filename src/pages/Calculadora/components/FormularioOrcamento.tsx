import React, { useState } from "react";
import styled from "styled-components";

import {
  FormContainer,
  InputGroup,
  Label,
  Input,
} from "../../../components/ui/Form";
import { Button } from "../../../components/ui/Button";

import type { OrcamentoForm } from "../../CalculadoraPage";
import { AutocompleteInput } from "./AutocompleteInput";

const BotaoRemover = styled.button`
  background-color: transparent;
  color: var(--color-alert);
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
`;

const LabelContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
`;

const AddButtonInline = styled(Button)`
  padding: 0.5rem !important;
  font-weight: 500 !important;
  min-width: 6rem;
`;

interface FormularioOrcamentoProps {
  onCalcular: (dados: OrcamentoForm) => void;
}

export function FormularioOrcamento({ onCalcular }: FormularioOrcamentoProps) {
  const [dados, setDados] = useState<OrcamentoForm>({
    origem: "",
    destino: "",
    paradas: [],
    numeroVeiculos: 1,
    numeroMotoristas: 1,
    quantidadeDiarias: 1,
  });

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDados((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleParadaChange = (index: number, value: string) => {
    const novasParadas = [...dados.paradas];
    novasParadas[index] = value;
    setDados((prev) => ({ ...prev, paradas: novasParadas }));
  };

  const handleAutocompleteChange = (
    fieldName: "origem" | "destino",
    value: string
  ) => {
    setDados((prev) => ({ ...prev, [fieldName]: value }));
  };

  const adicionarParada = () => {
    setDados((prev) => ({ ...prev, paradas: [...prev.paradas, ""] }));
  };

  const removerParada = (index: number) => {
    const novasParadas = dados.paradas.filter((_, i) => i !== index);
    setDados((prev) => ({ ...prev, paradas: novasParadas }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalcular(dados);
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <InputGroup>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            gap: "1rem",
          }}
        >
          <div style={{ flexGrow: 1, width: "100%" }}>
            <AutocompleteInput
              label="Origem"
              value={dados.origem}
              onChange={(value) =>
                setDados((prev) => ({ ...prev, origem: value }))
              }
              placeholder="Digite o endereço de partida..."
            />
          </div>

          <AddButtonInline
            variant="secondary"
            type="button"
            onClick={adicionarParada}
          >
            + Parada
          </AddButtonInline>
        </div>
      </InputGroup>

      {dados.paradas.map((parada, index) => (
        <InputGroup key={index} style={{ marginTop: "1rem" }}>
          <LabelContainer>
            <Label htmlFor={`parada-${index}`}>Parada {index + 1}</Label>
            <BotaoRemover type="button" onClick={() => removerParada(index)}>
              &times;
            </BotaoRemover>
          </LabelContainer>
          <AutocompleteInput
            label=""
            value={parada}
            onChange={(value) => handleParadaChange(index, value)}
            placeholder="Adicionar parada"
          />
        </InputGroup>
      ))}

      <InputGroup style={{ marginTop: "1rem" }}>
        <AutocompleteInput
          label="Destino"
          value={dados.destino}
          onChange={(value) => handleAutocompleteChange("destino", value)}
          placeholder="Digite o endereço de destino..."
        />
      </InputGroup>

      <div
        style={{
          display: "grid",
          marginTop: "1rem",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "1rem",
        }}
      >
        <InputGroup>
          <Label>Veículos</Label>
          <Input
            type="number"
            name="numeroVeiculos"
            value={dados.numeroVeiculos}
            onChange={handleNumberChange}
            min="1"
          />
        </InputGroup>
        <InputGroup>
          <Label>Motoristas</Label>
          <Input
            type="number"
            name="numeroMotoristas"
            value={dados.numeroMotoristas}
            onChange={handleNumberChange}
            min="1"
          />
        </InputGroup>

        <InputGroup>
          <Label>Diárias</Label>
          <Input
            type="number"
            name="quantidadeDiarias"
            value={dados.quantidadeDiarias}
            onChange={handleNumberChange}
            min="1"
          />
        </InputGroup>
      </div>

      <Button
        variant="primary"
        type="submit"
        style={{ marginTop: "1.5rem", width: "100%" }}
      >
        Calcular Orçamento
      </Button>
    </FormContainer>
  );
}
