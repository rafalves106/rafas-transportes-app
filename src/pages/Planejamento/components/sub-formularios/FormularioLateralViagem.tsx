import React from "react";
import styled from "styled-components";

// Sub-componentes que estarão dentro deste formulário lateral
import { DadosReservaCliente } from "./DadosReservaCliente";
import { SelecaoRecursosPrincipais } from "./SelecaoRecursosPrincipais";
import { ValoresViagem } from "./ValoresViagem";
import { StatusViagem } from "./StatusViagem";

// Tipos e serviços necessários para as props
import { type Vehicle } from "../../../../services/veiculoService";
import { type Driver } from "../../../../services/motoristaService";
import { type ViagemFormState } from "../FormNovaViagem";

const FormSectionSideContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 1.5rem 1rem 0;
  border-right: 1px solid #e9ecef;
  max-height: calc(90vh - 180px);
  overflow-y: auto;

  @media (max-width: 768px) {
    gap: 1rem;
    padding: 0;
    border: none;
    max-height: 100%;
  }
`;

interface FormularioLateralViagemProps {
  dadosFormulario: ViagemFormState;
  erros: { [key: string]: string };
  isEditing: boolean;
  isRota: boolean;
  listaVeiculos: Vehicle[];
  listaMotoristas: Driver[];
  veiculoIdSelecionado: string;
  motoristaIdSelecionado: string;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  onVeiculoChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onMotoristaChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function FormularioLateralViagem({
  dadosFormulario,
  erros,
  isEditing,
  isRota,
  listaVeiculos,
  listaMotoristas,
  veiculoIdSelecionado,
  motoristaIdSelecionado,
  onInputChange,
  onVeiculoChange,
  onMotoristaChange,
}: FormularioLateralViagemProps) {
  return (
    <FormSectionSideContainer>
      <DadosReservaCliente
        title={dadosFormulario.title}
        clientName={dadosFormulario.clientName}
        telefone={dadosFormulario.telefone}
        erros={erros}
        onInputChange={onInputChange}
      />

      {!isRota && (
        <SelecaoRecursosPrincipais
          listaVeiculos={listaVeiculos}
          listaMotoristas={listaMotoristas}
          veiculoIdSelecionado={veiculoIdSelecionado}
          motoristaIdSelecionado={motoristaIdSelecionado}
          erros={erros}
          onVeiculoChange={onVeiculoChange}
          onMotoristaChange={onMotoristaChange}
        />
      )}

      <ValoresViagem
        valor={dadosFormulario.valor}
        erros={erros}
        onInputChange={onInputChange}
      />

      {isEditing && (
        <StatusViagem
          currentStatus={dadosFormulario.status}
          onStatusChange={onInputChange}
        />
      )}
    </FormSectionSideContainer>
  );
}
