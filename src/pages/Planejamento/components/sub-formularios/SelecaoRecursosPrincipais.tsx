import React from "react";
import styled from "styled-components";
import {
  InputGroup,
  Label,
  Select,
  ErrorMessage,
  SectionTitle,
} from "../../../../components/ui/Form";
import { type Vehicle } from "../../../../services/veiculoService";
import { type Driver } from "../../../../services/motoristaService";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

interface SelecaoRecursosPrincipaisProps {
  listaVeiculos: Vehicle[];
  listaMotoristas: Driver[];
  veiculoIdSelecionado: string;
  motoristaIdSelecionado: string;
  erros: { [key: string]: string };
  onVeiculoChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onMotoristaChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function SelecaoRecursosPrincipais({
  listaVeiculos,
  listaMotoristas,
  veiculoIdSelecionado,
  motoristaIdSelecionado,
  erros,
  onVeiculoChange,
  onMotoristaChange,
}: SelecaoRecursosPrincipaisProps) {
  return (
    <Container>
      {/* Seção Veículos */}
      <InputGroup>
        <SectionTitle>Veículos</SectionTitle>
        <Label htmlFor="veiculoIdSelecionado">Veículo</Label>
        <Select
          id="veiculoIdSelecionado"
          value={veiculoIdSelecionado}
          onChange={onVeiculoChange}
          hasError={!!erros.veiculoIdSelecionado}
        >
          <option value="">Selecione um veículo</option>
          {listaVeiculos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.model} ({v.plate})
            </option>
          ))}
        </Select>
        {erros.veiculoIdSelecionado && (
          <ErrorMessage>{erros.veiculoIdSelecionado}</ErrorMessage>
        )}
      </InputGroup>

      {/* Seção Motoristas */}
      <InputGroup>
        <SectionTitle>Motoristas</SectionTitle>
        <Label htmlFor="motoristaIdSelecionado">Motorista</Label>
        <Select
          id="motoristaIdSelecionado"
          value={motoristaIdSelecionado}
          onChange={onMotoristaChange}
          hasError={!!erros.motoristaIdSelecionado}
        >
          <option value="">Selecione um motorista</option>
          {listaMotoristas.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nome}
            </option>
          ))}
        </Select>
        {erros.motoristaIdSelecionado && (
          <ErrorMessage>{erros.motoristaIdSelecionado}</ErrorMessage>
        )}
      </InputGroup>
    </Container>
  );
}
