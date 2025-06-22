import React, { useState } from "react";
import styled from "styled-components";

const FormContainer = styled.form``;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 30% 70%;
`;

const FormSectionSide = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 1rem;
  padding-right: 1rem;
  margin-bottom: 2rem;
  border-right: 1px solid var(--cor-bordas);
`;

const FormSection = styled.div`
  padding-top: 1rem;
  padding-left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  color: var(--cor-titulos);
  font-weight: 600;
  margin-bottom: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const InputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 400;
  font-size: 0.9rem;
  color: var(--cor-titulos-secundaria);
`;

const Input = styled.input`
  width: 100%;
  font-size: 0.7rem;
  height: 1rem;
  padding: 0.75rem;
  border: 1px solid var(--cor-bordas);
  background-color: var(--cor-de-fundo);
  border-radius: 6px;
  margin-bottom: 1rem;
`;

const Select = styled.select`
  margin-bottom: 1rem;
  width: 100%;
  font-size: 0.7rem;
  height: 2rem;
  padding-left: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: var(--cor-de-fundo);
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.7rem;
  height: 4rem;
  min-height: 4rem;
  resize: none;
  background-color: var(--cor-de-fundo);
`;

export function FormNovaViagem() {
  const [nomeCliente, setNomeCliente] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Formulário enviado!");
  };

  return (
    <FormContainer id="form-nova-viagem" onSubmit={handleSubmit}>
      <FormGrid>
        <FormSectionSide>
          <InputGroup>
            <SectionTitle>Dados Cliente</SectionTitle>
            <Label htmlFor="nome-cliente">Nome Cliente</Label>
            <Input
              id="nome-cliente"
              type="text"
              value={nomeCliente}
              onChange={(e) => setNomeCliente(e.target.value)}
            />
          </InputGroup>
          <InputGroup>
            <Label htmlFor="telefone-cliente">Telefone Cliente</Label>
            <Input id="telefone-cliente" type="text" />
          </InputGroup>

          <InputGroup>
            <SectionTitle>Veículo</SectionTitle>
            <Label htmlFor="veiculo">Selecione</Label>
            <Select id="veiculo">
              <option>Não definido</option>
              <option>Sprinter 416</option>
            </Select>
          </InputGroup>

          <InputGroup>
            <SectionTitle>Motorista</SectionTitle>
            <Label htmlFor="motorista">Selecione</Label>
            <Select id="motorista">
              <option>Não definido</option>
              <option>Robson Almeida</option>
            </Select>
          </InputGroup>

          <InputGroup>
            <SectionTitle>Valores</SectionTitle>
            <Label htmlFor="valor">Valor do Serviço</Label>
            <Input id="valor" type="text" />
          </InputGroup>
        </FormSectionSide>

        <FormSection>
          <InputGroup>
            <Label htmlFor="tipo-viagem">Dados da Viagem</Label>
            <Select id="tipo-viagem">
              <option>Selecione o tipo de viagem</option>
              <option>Fretamento Aeroporto Confins</option>
              <option>Viagem Ida e Volta dentro de MG - DER/MG</option>
              <option>Viagem Ida e Volta fora de MG - ANTT</option>
              <option>Rota de Colaboradores</option>
            </Select>
          </InputGroup>

          <InputRow>
            <InputGroup>
              <Label htmlFor="data-inicio">Data de Início</Label>
              <Input id="data-inicio" type="date" />
            </InputGroup>
            <InputGroup>
              <Label htmlFor="horario-saida">Hora Saída</Label>
              <Input id="horario-saida" type="time" />
            </InputGroup>
            <InputGroup>
              <Label htmlFor="passageiros-ida">Passageiros</Label>
              <Input id="passageiros-ida" type="number" />
            </InputGroup>
          </InputRow>
          <InputGroup>
            <Label htmlFor="desc-ida">Breve Descrição</Label>
            <Textarea id="desc-ida" />
          </InputGroup>

          <InputRow>
            <InputGroup>
              <Label htmlFor="data-retorno">Data de Retorno</Label>
              <Input id="data-retorno" type="date" />
            </InputGroup>
            <InputGroup>
              <Label htmlFor="horario-volta">Hora Volta</Label>
              <Input id="horario-volta" type="time" />
            </InputGroup>
            <InputGroup>
              <Label htmlFor="passageiros-volta">Passageiros</Label>
              <Input id="passageiros-volta" type="number" />
            </InputGroup>
          </InputRow>
          <InputGroup>
            <Label htmlFor="desc-volta">Breve Descrição</Label>
            <Textarea id="desc-volta" />
          </InputGroup>
        </FormSection>
      </FormGrid>
    </FormContainer>
  );
}
