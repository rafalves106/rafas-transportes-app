import React, { useState } from "react";
import styled from "styled-components";
import type { OrcamentoForm } from "../../CalculadoraPage";
import {
  FormContainer,
  InputGroup,
  Label,
  Input,
  Select,
} from "../../../components/ui/Form";
import { Button } from "../../../components/ui/Button";
import { vehiclesData } from "../../../data/vehiclesData";
import { driversData } from "../../../data/driversData";
import { AutocompleteInput } from "./AutocompleteInput";

const BotaoRemover = styled.button`
  background-color: transparent;
  color: var(--cor-remover);
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
`;
const BlocoDinamico = styled.div`
  border-top: 1px solid var(--cor-bordas);
  padding-top: 1rem;
  margin-top: 1rem;
`;
const LabelContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
`;
const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const AddButtonInline = styled(Button)`
  padding: 0.5rem !important;
  font-weight: 500 !important;
  align-self: center;
  height: fit-content;
`;

interface FormularioOrcamentoProps {
  onCalcular: (dados: OrcamentoForm) => void;
}

export function FormularioOrcamento({ onCalcular }: FormularioOrcamentoProps) {
  const [dados, setDados] = useState<OrcamentoForm>({
    origem: "",
    destino: "",
    paradas: [],
    passageiros: 1,
    veiculos: [{ id: "", passageiros: 1 }],
    motoristas: [{ id: "", diarias: 1 }],
  });

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

  const handleVeiculoChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    const novosVeiculos = [...dados.veiculos];
    novosVeiculos[index] = { ...novosVeiculos[index], [name]: value };
    setDados((prev) => ({ ...prev, veiculos: novosVeiculos }));
  };

  const adicionarVeiculo = () => {
    setDados((prev) => ({
      ...prev,
      veiculos: [...prev.veiculos, { id: "", passageiros: 1 }],
    }));
  };

  const removerVeiculo = (index: number) => {
    if (dados.veiculos.length <= 1) return;
    const novosVeiculos = dados.veiculos.filter((_, i) => i !== index);
    setDados((prev) => ({ ...prev, veiculos: novosVeiculos }));
  };

  const handleMotoristaChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    const novosMotoristas = [...dados.motoristas];
    novosMotoristas[index] = { ...novosMotoristas[index], [name]: value };
    setDados((prev) => ({ ...prev, motoristas: novosMotoristas }));
  };

  const adicionarMotorista = () => {
    setDados((prev) => ({
      ...prev,
      motoristas: [...prev.motoristas, { id: "", diarias: 1 }],
    }));
  };

  const removerMotorista = (index: number) => {
    if (dados.motoristas.length <= 1) return;
    const novosMotoristas = dados.motoristas.filter((_, i) => i !== index);
    setDados((prev) => ({ ...prev, motoristas: novosMotoristas }));
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
            alignItems: "center",
          }}
        >
          <Label htmlFor="origem">Origem</Label>
          <AddButtonInline
            variant="secondary"
            type="button"
            onClick={adicionarParada}
          >
            + Parada
          </AddButtonInline>
        </div>
        <AutocompleteInput
          label="Origem"
          value={dados.origem}
          onChange={(value) => setDados((prev) => ({ ...prev, origem: value }))}
          placeholder="Digite o endereço de partida..."
        />
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

      <BlocoDinamico>
        <SectionHeader>
          <Label>Veículos</Label>
          <AddButtonInline
            variant="secondary"
            type="button"
            onClick={adicionarVeiculo}
          >
            + Add Veículo
          </AddButtonInline>
        </SectionHeader>
        {dados.veiculos.map((veiculo, index) => (
          <InputGroup key={index} style={{ marginTop: "0.5rem" }}>
            <LabelContainer>
              <Label style={{ fontSize: "0.8rem" }}>Veículo {index + 1}</Label>
              {index > 0 && (
                <BotaoRemover
                  type="button"
                  onClick={() => removerVeiculo(index)}
                >
                  &times;
                </BotaoRemover>
              )}
            </LabelContainer>
            <div style={{ display: "flex", gap: "1rem" }}>
              <Select
                name="id"
                value={veiculo.id}
                onChange={(e) => handleVeiculoChange(index, e)}
                style={{ flex: 3 }}
              >
                <option value="">Selecione um veículo</option>
                {vehiclesData.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.model} ({v.plate})
                  </option>
                ))}
              </Select>
              <Input
                name="passageiros"
                type="number"
                placeholder="Passageiros"
                min="1"
                value={veiculo.passageiros}
                onChange={(e) => handleVeiculoChange(index, e)}
                style={{ flex: 1 }}
              />
            </div>
          </InputGroup>
        ))}
      </BlocoDinamico>

      <BlocoDinamico>
        <SectionHeader>
          <Label>Motoristas</Label>
          <AddButtonInline
            variant="secondary"
            type="button"
            onClick={adicionarMotorista}
          >
            + Add Motorista
          </AddButtonInline>
        </SectionHeader>
        {dados.motoristas.map((motorista, index) => (
          <InputGroup key={index} style={{ marginTop: "0.5rem" }}>
            <LabelContainer>
              <Label style={{ fontSize: "0.8rem" }}>
                Motorista {index + 1}
              </Label>
              {index > 0 && (
                <BotaoRemover
                  type="button"
                  onClick={() => removerMotorista(index)}
                >
                  &times;
                </BotaoRemover>
              )}
            </LabelContainer>
            <div style={{ display: "flex", gap: "1rem" }}>
              <Select
                name="id"
                value={motorista.id}
                onChange={(e) => handleMotoristaChange(index, e)}
                style={{ flex: 3 }}
              >
                <option value="">Selecione um motorista</option>
                {driversData.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>
              <Input
                name="diarias"
                type="number"
                placeholder="Diárias"
                min="1"
                value={motorista.diarias}
                onChange={(e) => handleMotoristaChange(index, e)}
                style={{ flex: 1 }}
              />
            </div>
          </InputGroup>
        ))}
      </BlocoDinamico>

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
