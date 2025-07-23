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
import { type HorarioItemRota } from "../../../../services/viagemService";
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
  flex-wrap: wrap;
`;
const LabelContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
interface ItemRotaFormState {
  veiculoId: string;
  motoristaId: string;
  horarios: HorarioItemRota[];
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
  handleHorarioChange: (
    veiculoIndex: number,
    horarioIndex: number,
    field: "dataInicio" | "inicio" | "dataFim" | "fim",
    value: string
  ) => void;
  adicionarHorario: (veiculoIndex: number) => void;
  removerHorario: (veiculoIndex: number, horarioIndex: number) => void;
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
  handleHorarioChange,
  adicionarHorario,
  removerHorario,
}: RotaColaboradoresFormProps) {
  return (
    <Container>
      {}
      {}
      <SectionTitle style={{ marginTop: "0rem" }}>
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
            {}
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
            {}
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
          {}
          <Label>Períodos de Horário do Item</Label>
          {itemRota.horarios.map((horario, horarioIndex) => (
            <RotaHorarioContainer key={horarioIndex}>
              {}
              <InputGroup>
                <Label htmlFor={`data-inicio-${veiculoIndex}-${horarioIndex}`}>
                  Data Início
                </Label>
                <Input
                  id={`data-inicio-${veiculoIndex}-${horarioIndex}`}
                  type="date"
                  value={horario.dataInicio || ""}
                  onChange={(e) =>
                    handleHorarioChange(
                      veiculoIndex,
                      horarioIndex,
                      "dataInicio",
                      e.target.value
                    )
                  }
                  hasError={
                    !!erros[
                      `rota[${veiculoIndex}].horarios[${horarioIndex}].dataInicio`
                    ]
                  }
                />
                {erros[
                  `rota[${veiculoIndex}].horarios[${horarioIndex}].dataInicio`
                ] && (
                  <ErrorMessage>
                    {
                      erros[
                        `rota[${veiculoIndex}].horarios[${horarioIndex}].dataInicio`
                      ]
                    }
                  </ErrorMessage>
                )}
              </InputGroup>
              {}
              <InputGroup>
                <Label htmlFor={`hora-inicio-${veiculoIndex}-${horarioIndex}`}>
                  Hora Início
                </Label>
                <Input
                  id={`hora-inicio-${veiculoIndex}-${horarioIndex}`}
                  type="time"
                  value={horario.inicio || ""}
                  onChange={(e) =>
                    handleHorarioChange(
                      veiculoIndex,
                      horarioIndex,
                      "inicio",
                      e.target.value
                    )
                  }
                  hasError={
                    !!erros[
                      `rota[${veiculoIndex}].horarios[${horarioIndex}].inicio`
                    ]
                  }
                />
                {erros[
                  `rota[${veiculoIndex}].horarios[${horarioIndex}].inicio`
                ] && (
                  <ErrorMessage>
                    {
                      erros[
                        `rota[${veiculoIndex}].horarios[${horarioIndex}].inicio`
                      ]
                    }
                  </ErrorMessage>
                )}
              </InputGroup>
              {}
              <InputGroup>
                <Label htmlFor={`data-fim-${veiculoIndex}-${horarioIndex}`}>
                  Data Fim
                </Label>
                <Input
                  id={`data-fim-${veiculoIndex}-${horarioIndex}`}
                  type="date"
                  value={horario.dataFim || ""}
                  onChange={(e) =>
                    handleHorarioChange(
                      veiculoIndex,
                      horarioIndex,
                      "dataFim",
                      e.target.value
                    )
                  }
                  hasError={
                    !!erros[
                      `rota[${veiculoIndex}].horarios[${horarioIndex}].dataFim`
                    ]
                  }
                />
                {erros[
                  `rota[${veiculoIndex}].horarios[${horarioIndex}].dataFim`
                ] && (
                  <ErrorMessage>
                    {
                      erros[
                        `rota[${veiculoIndex}].horarios[${horarioIndex}].dataFim`
                      ]
                    }
                  </ErrorMessage>
                )}
              </InputGroup>
              {}
              <InputGroup>
                <Label htmlFor={`hora-fim-${veiculoIndex}-${horarioIndex}`}>
                  Hora Fim
                </Label>
                <Input
                  id={`hora-fim-${veiculoIndex}-${horarioIndex}`}
                  type="time"
                  value={horario.fim || ""}
                  onChange={(e) =>
                    handleHorarioChange(
                      veiculoIndex,
                      horarioIndex,
                      "fim",
                      e.target.value
                    )
                  }
                  hasError={
                    !!erros[
                      `rota[${veiculoIndex}].horarios[${horarioIndex}].fim`
                    ]
                  }
                />
                {erros[
                  `rota[${veiculoIndex}].horarios[${horarioIndex}].fim`
                ] && (
                  <ErrorMessage>
                    {
                      erros[
                        `rota[${veiculoIndex}].horarios[${horarioIndex}].fim`
                      ]
                    }
                  </ErrorMessage>
                )}
              </InputGroup>
              {horarioIndex > 0 && (
                <Button
                  variant="danger"
                  type="button"
                  onClick={() => removerHorario(veiculoIndex, horarioIndex)}
                >
                  &times;
                </Button>
              )}
            </RotaHorarioContainer>
          ))}
          {erros[`rota[${veiculoIndex}].horarios`] && (
            <ErrorMessage>
              {erros[`rota[${veiculoIndex}].horarios`]}
            </ErrorMessage>
          )}
          <Button
            variant="primary"
            type="button"
            onClick={() => adicionarHorario(veiculoIndex)}
          >
            + Adicionar Período
          </Button>
        </RotaVeiculoBloco>
      ))}
      {erros.rota && <ErrorMessage>{erros.rota}</ErrorMessage>}
      <Button
        variant="primary"
        type="button"
        onClick={adicionarVeiculoRota}
        style={{ marginTop: "1rem" }}
      >
        + Adicionar Van e Motorista
      </Button>
    </Container>
  );
}
