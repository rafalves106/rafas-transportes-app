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

const ParadaContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;
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

interface FormularioOrcamentoProps {
  onCalcular: (dados: OrcamentoForm) => void;
}

export function FormularioOrcamento({ onCalcular }: FormularioOrcamentoProps) {
  const [dados, setDados] = useState<OrcamentoForm>({
    origem: "",
    destino: "",
    paradas: [],
    veiculos: [{ id: "", passageiros: 1 }],
    motoristas: [{ id: "" }],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDados((prev) => ({ ...prev, [name]: value }));
  };

  const handleParadaChange = (index: number, value: string) => {
    const novasParadas = [...dados.paradas];
    novasParadas[index] = value;
    setDados((prev) => ({ ...prev, paradas: novasParadas }));
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
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const novosMotoristas = [...dados.motoristas];
    novosMotoristas[index] = {
      ...novosMotoristas[index],
      id: event.target.value,
    };
    setDados((prev) => ({ ...prev, motoristas: novosMotoristas }));
  };

  const adicionarMotorista = () => {
    setDados((prev) => ({
      ...prev,
      motoristas: [...prev.motoristas, { id: "" }],
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
        <Label htmlFor="origem">Origem</Label>
        <Input
          name="origem"
          id="origem"
          value={dados.origem}
          onChange={handleInputChange}
          placeholder="Ex: Belo Horizonte, MG"
        />
      </InputGroup>

      {dados.paradas.map((parada, index) => (
        <InputGroup key={index}>
          <Label htmlFor={`parada-${index}`}>Parada {index + 1}</Label>
          <ParadaContainer>
            <Input
              name={`parada-${index}`}
              id={`parada-${index}`}
              value={parada}
              onChange={(e) => handleParadaChange(index, e.target.value)}
              placeholder="Adicionar parada"
            />
            <BotaoRemover type="button" onClick={() => removerParada(index)}>
              &times;
            </BotaoRemover>
          </ParadaContainer>
        </InputGroup>
      ))}
      <Button
        variant="secondary"
        type="button"
        onClick={adicionarParada}
        style={{ padding: "0.5rem", fontWeight: 500 }}
      >
        + Adicionar Parada
      </Button>

      <InputGroup style={{ marginTop: "1rem" }}>
        <Label htmlFor="destino">Destino</Label>
        <Input
          name="destino"
          id="destino"
          value={dados.destino}
          onChange={handleInputChange}
          placeholder="Ex: Rio de Janeiro, RJ"
        />
      </InputGroup>

      <BlocoDinamico>
        {dados.veiculos.map((veiculo, index) => (
          <InputGroup key={index}>
            <LabelContainer>
              <Label>Veículo {index + 1}</Label>
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
                min="1"
                value={veiculo.passageiros}
                onChange={(e) => handleVeiculoChange(index, e)}
                style={{ flex: 1 }}
              />
            </div>
          </InputGroup>
        ))}
        <Button variant="secondary" type="button" onClick={adicionarVeiculo}>
          + Add Veículo
        </Button>
      </BlocoDinamico>

      <BlocoDinamico>
        {dados.motoristas.map((motorista, index) => (
          <InputGroup key={index}>
            <LabelContainer>
              <Label>Motorista {index + 1}</Label>
              {index > 0 && (
                <BotaoRemover
                  type="button"
                  onClick={() => removerMotorista(index)}
                >
                  &times;
                </BotaoRemover>
              )}
            </LabelContainer>
            <Select
              name="id"
              value={motorista.id}
              onChange={(e) => handleMotoristaChange(index, e)}
            >
              <option value="">Selecione um motorista</option>
              {driversData.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </InputGroup>
        ))}
        <Button variant="secondary" type="button" onClick={adicionarMotorista}>
          + Add Motorista
        </Button>
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
