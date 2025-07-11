import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useOutletContext, useParams, useLocation } from "react-router-dom";

import { useNavigate } from "react-router-dom";

import { driversData } from "../../../data/driversData";
import { vehiclesData } from "../../../data/vehiclesData";
import type { Trip } from "../../../data/tripsData";
import { tripsData } from "../../../data/tripsData";
import { ConfirmationModal } from "../../../components/ConfirmationModal";

import { Button } from "../../../components/ui/Button";

import {
  FormContainer,
  InputGroup,
  Label,
  Input,
  Select,
  ErrorMessage,
  Textarea,
} from "../../../components/ui/Form";

import { InputRow } from "../../../components/ui/Layout";

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 30% 1fr;
`;
const FormSectionSide = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 1.5rem 1rem 0;
  border-right: 1px solid #e9ecef;
  max-height: calc(90vh - 180px);
  overflow-y: auto;
`;

const ModalFooter = styled.footer`
  padding: 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
`;

const FormSection = styled.div`
  padding: 1rem 0 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-height: calc(90vh - 180px);
  overflow-y: auto;
`;
const SectionTitle = styled.h3`
  font-size: 1rem;
  color: #343a40;
  font-weight: 600;
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e9ecef;
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

interface FormContextType {
  onAdicionarViagem: (dados: Omit<Trip, "id" | "status">) => void;
  onEditarViagem: (id: number, dados: Omit<Trip, "id" | "status">) => void;
  onExcluirViagem: (id: number) => void;
}

export function FormularioNovaViagem() {
  const { tripId } = useParams();
  const { onAdicionarViagem, onEditarViagem, onExcluirViagem } =
    useOutletContext<FormContextType>();
  const isEditing = !!tripId;
  const location = useLocation();

  const navigate = useNavigate();

  const [dadosFormulario, setDadosFormulario] = useState({
    title: "",
    clientName: "",
    telefone: "",
    value: "",
    tipoViagem: "ida_e_volta_mg",
    startDate: "",
    startTime: "",
    startLocation: "",
    endDate: "",
    endTime: "",
    endLocation: "",
    veiculos: [{ id: "" }],
    motoristas: [{ id: "" }],
    rota: [{ veiculoId: "", horarios: [{ inicio: "", fim: "" }] }],
  });
  const [erros, setErros] = useState<{ [key: string]: string }>({});
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    const dadosDoOrcamento = location.state?.dadosDoOrcamento;
    const viagemParaEditar = isEditing
      ? tripsData.find((trip) => trip.id === parseInt(tripId!))
      : null;

    if (isEditing && viagemParaEditar) {
      setDadosFormulario({
        title: viagemParaEditar.title,
        clientName: viagemParaEditar.clientName,
        telefone: "",
        value: String(viagemParaEditar.value),
        tipoViagem: "ida_e_volta_mg",
        startDate: viagemParaEditar.startDate,
        startTime: viagemParaEditar.startTime,
        startLocation: viagemParaEditar.startLocation,
        endDate: viagemParaEditar.endDate,
        endTime: viagemParaEditar.endTime,
        endLocation: viagemParaEditar.endLocation,
        veiculos: [{ id: String(viagemParaEditar.vehicleId) }],
        motoristas: [{ id: String(viagemParaEditar.driverId) }],
        rota: [],
      });
    } else if (dadosDoOrcamento && !isEditing) {
      setDadosFormulario({
        title: `Viagem: ${dadosDoOrcamento.origem} para ${dadosDoOrcamento.destino}`,
        clientName: "",
        telefone: "",
        value: "",
        tipoViagem: "ida_e_volta_mg",
        startDate: "",
        startTime: "",
        startLocation: dadosDoOrcamento.origem,
        endDate: "",
        endTime: "",
        endLocation: dadosDoOrcamento.destino,
        veiculos: dadosDoOrcamento.veiculos.map(
          (v: { id: string; passageiros: number }) => ({ id: v.id })
        ),
        motoristas: dadosDoOrcamento.motoristas.map(
          (m: { id: string; diarias: number }) => ({ id: m.id })
        ),
        rota: [{ veiculoId: "", horarios: [{ inicio: "", fim: "" }] }],
      });
    }
  }, [tripId, isEditing, location.state]);

  useEffect(() => {
    if (isEditing || location.state?.dadosDoOrcamento) return;

    let textoIda = "";
    let textoVolta = "";

    switch (dadosFormulario.tipoViagem) {
      case "fretamento_aeroporto":
        textoIda =
          "Buscar passageiros em [ENDEREÇO] e levar ao Aeroporto de Confins.";
        textoVolta =
          "Buscar passageiros no Aeroporto de Confins e levar para [ENDEREÇO].";
        break;
      case "ida_e_volta_mg":
        textoIda = "Percurso de ida para [CIDADE-DESTINO].";
        textoVolta = "Percurso de volta de [CIDADE-DESTINO].";
        break;
      case "somente_ida_mg":
        textoIda = "Percurso somente de ida para [CIDADE-DESTINO].";
        textoVolta = "";
        break;
      case "ida_e_volta_fora_mg":
        textoIda =
          "Percurso ida e volta saindo de [CIDADE-INICIAL] para [CIDADE-DESTINO].";
        textoVolta =
          "Volta do percurso saindo de [CIDADE-INICIAL] para [CIDADE-DESTINO].";
        break;
      case "somente_ida_fora_mg":
        textoIda =
          "Percurso somente ida saindo de [CIDADE-INICIAL] para [CIDADE-DESTINO].";
        textoVolta = "";
        break;
      default:
        textoIda = "";
        textoVolta = "";
        break;
    }

    setDadosFormulario((prev) => ({
      ...prev,
      startLocation: textoIda,
      endLocation: textoVolta,
    }));
  }, [dadosFormulario.tipoViagem, isEditing, location.state]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setDadosFormulario((prev) => ({ ...prev, [name]: value }));
    if (erros[name]) {
      setErros((prevErros) => ({ ...prevErros, [name]: "" }));
    }
  };

  const handleDynamicListChange = (
    index: number,
    event: React.ChangeEvent<HTMLSelectElement>,
    listName: "veiculos" | "motoristas"
  ) => {
    const newList = [...dadosFormulario[listName]];
    newList[index].id = event.target.value;
    setDadosFormulario((prev) => ({ ...prev, [listName]: newList }));
  };

  const addToList = (listName: "veiculos" | "motoristas") => {
    setDadosFormulario((prev) => ({
      ...prev,
      [listName]: [...prev[listName], { id: "" }],
    }));
  };

  const removeFromList = (
    index: number,
    listName: "veiculos" | "motoristas"
  ) => {
    const newList = dadosFormulario[listName].filter((_, i) => i !== index);
    setDadosFormulario((prev) => ({ ...prev, [listName]: newList }));
  };

  const handleRotaVeiculoChange = (
    veiculoIndex: number,
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const novaRota = [...dadosFormulario.rota];
    novaRota[veiculoIndex].veiculoId = event.target.value;
    setDadosFormulario((prev) => ({ ...prev, rota: novaRota }));
  };

  const adicionarVeiculoRota = () => {
    setDadosFormulario((prev) => ({
      ...prev,
      rota: [
        ...prev.rota,
        { veiculoId: "", horarios: [{ inicio: "", fim: "" }] },
      ],
    }));
  };

  const removerVeiculoRota = (veiculoIndex: number) => {
    const novaRota = dadosFormulario.rota.filter(
      (_, index) => index !== veiculoIndex
    );
    setDadosFormulario((prev) => ({ ...prev, rota: novaRota }));
  };

  const handleHorarioRotaChange = (
    veiculoIndex: number,
    horarioIndex: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    const novaRota = [...dadosFormulario.rota];
    novaRota[veiculoIndex].horarios[horarioIndex][name as "inicio" | "fim"] =
      value;
    setDadosFormulario((prev) => ({ ...prev, rota: novaRota }));
  };

  const adicionarHorario = (veiculoIndex: number) => {
    const novaRota = [...dadosFormulario.rota];
    novaRota[veiculoIndex].horarios.push({ inicio: "", fim: "" });
    setDadosFormulario((prev) => ({ ...prev, rota: novaRota }));
  };

  const removerHorario = (veiculoIndex: number, horarioIndex: number) => {
    const novaRota = [...dadosFormulario.rota];
    novaRota[veiculoIndex].horarios = novaRota[veiculoIndex].horarios.filter(
      (_, index) => index !== horarioIndex
    );
    setDadosFormulario((prev) => ({ ...prev, rota: novaRota }));
  };

  const validate = () => {
    const novosErros: { [key: string]: string } = {};
    if (!dadosFormulario.title.trim())
      novosErros.title = "Título é obrigatório.";
    if (!dadosFormulario.clientName.trim())
      novosErros.clientName = "Nome é obrigatório.";
    if (!dadosFormulario.value || parseFloat(dadosFormulario.value) <= 0)
      novosErros.value = "Valor é obrigatório.";
    const isRota = dadosFormulario.tipoViagem === "rota_colaboradores";
    if (!isRota) {
      if (!dadosFormulario.startDate)
        novosErros.startDate = "Data de início é obrigatória.";
      if (!dadosFormulario.startTime)
        novosErros.startTime = "Hora de saída é obrigatória.";
    }
    const isIdaEVolta = dadosFormulario.tipoViagem.includes("ida_e_volta");
    if (isIdaEVolta) {
      if (!dadosFormulario.endDate)
        novosErros.endDate = "Data de retorno é obrigatória.";
      if (!dadosFormulario.endTime)
        novosErros.endTime = "Hora de volta é obrigatória.";
    }
    return novosErros;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const errosDeValidacao = validate();
    if (Object.keys(errosDeValidacao).length > 0) {
      setErros(errosDeValidacao);
      return;
    }
    setErros({});
    const dadosParaSalvar = {
      title: dadosFormulario.title,
      clientName: dadosFormulario.clientName,
      value: parseFloat(dadosFormulario.value) || 0,
      startDate: dadosFormulario.startDate,
      startTime: dadosFormulario.startTime,
      endDate: dadosFormulario.endDate,
      endTime: dadosFormulario.endTime,
      startLocation: dadosFormulario.startLocation,
      endLocation: dadosFormulario.endLocation,
      vehicleId: parseInt(dadosFormulario.veiculos[0]?.id) || 0,
      driverId: parseInt(dadosFormulario.motoristas[0]?.id) || 0,
    };
    if (isEditing && tripId) {
      onEditarViagem(parseInt(tripId), dadosParaSalvar);
    } else {
      onAdicionarViagem(dadosParaSalvar);
    }
  };

  const handleExcluirClick = () => {
    setIsConfirmModalOpen(true);
  };
  const handleConfirmarExclusao = () => {
    if (!tripId) return;
    onExcluirViagem(parseInt(tripId));
    setIsConfirmModalOpen(false);
  };

  const isRota = dadosFormulario.tipoViagem === "rota_colaboradores";
  const mostraPercursoIda = [
    "ida_e_volta_mg",
    "somente_ida_mg",
    "ida_e_volta_fora_mg",
    "somente_ida_fora_mg",
    "fretamento_aeroporto",
  ].includes(dadosFormulario.tipoViagem);
  const mostraPercursoVolta = [
    "ida_e_volta_mg",
    "ida_e_volta_fora_mg",
    "fretamento_aeroporto",
  ].includes(dadosFormulario.tipoViagem);

  return (
    <>
      <FormContainer
        id={isEditing ? `form-editar-viagem-${tripId}` : "form-nova-viagem"}
        onSubmit={handleSubmit}
      >
        <FormGrid>
          <FormSectionSide>
            <InputGroup>
              <SectionTitle>Dados da Reserva</SectionTitle>
              <Label htmlFor="title">Título da Reserva</Label>
              <Input
                id="title"
                name="title"
                type="text"
                value={dadosFormulario.title}
                onChange={handleInputChange}
                hasError={!!erros.title}
              />
              {erros.title && <ErrorMessage>{erros.title}</ErrorMessage>}
            </InputGroup>
            <InputGroup>
              <SectionTitle>Dados Cliente</SectionTitle>
              <Label htmlFor="clientName">Nome Cliente</Label>
              <Input
                id="clientName"
                name="clientName"
                type="text"
                value={dadosFormulario.clientName}
                onChange={handleInputChange}
                hasError={!!erros.clientName}
              />
              {erros.clientName && (
                <ErrorMessage>{erros.clientName}</ErrorMessage>
              )}
              <Label htmlFor="telefone">Telefone Cliente</Label>
              <Input
                id="telefone"
                name="telefone"
                type="text"
                value={dadosFormulario.telefone}
                onChange={handleInputChange}
              />
            </InputGroup>
            {!isRota && (
              <InputGroup>
                <SectionTitle>Veículos</SectionTitle>
                {dadosFormulario.veiculos.map((veiculo, index) => (
                  <div key={index}>
                    <LabelContainer>
                      <Label htmlFor={`veiculo-${index}`}>
                        Veículo {index + 1}
                      </Label>
                      {index > 0 && (
                        <Button
                          variant="danger"
                          type="button"
                          onClick={() => removeFromList(index, "veiculos")}
                        >
                          &times;
                        </Button>
                      )}
                    </LabelContainer>
                    <Select
                      id={`veiculo-${index}`}
                      value={veiculo.id}
                      onChange={(e) =>
                        handleDynamicListChange(index, e, "veiculos")
                      }
                    >
                      <option value="">Selecione</option>
                      {vehiclesData.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.model} ({v.plate})
                        </option>
                      ))}
                    </Select>
                  </div>
                ))}
                <Button
                  variant="primary"
                  type="button"
                  onClick={() => addToList("veiculos")}
                >
                  + Adicionar Veículo
                </Button>
              </InputGroup>
            )}
            <InputGroup>
              <SectionTitle>Motoristas</SectionTitle>
              {dadosFormulario.motoristas.map((motorista, index) => (
                <div key={index}>
                  <LabelContainer>
                    <Label htmlFor={`motorista-${index}`}>
                      Motorista {index + 1}
                    </Label>
                    {index > 0 && (
                      <Button
                        variant="danger"
                        type="button"
                        onClick={() => removeFromList(index, "motoristas")}
                      >
                        &times;
                      </Button>
                    )}
                  </LabelContainer>
                  <Select
                    id={`motorista-${index}`}
                    value={motorista.id}
                    onChange={(e) =>
                      handleDynamicListChange(index, e, "motoristas")
                    }
                  >
                    <option value="">Selecione</option>
                    {driversData.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}{" "}
                  </Select>
                </div>
              ))}
              <Button
                variant="primary"
                type="button"
                onClick={() => addToList("motoristas")}
              >
                + Adicionar Motorista
              </Button>
            </InputGroup>
            <InputGroup>
              <SectionTitle>Valores</SectionTitle>
              <Label htmlFor="value">Valor do Serviço</Label>
              <Input
                id="value"
                name="value"
                type="number"
                placeholder="R$"
                value={dadosFormulario.value}
                onChange={handleInputChange}
                hasError={!!erros.value}
              />
              {erros.value && <ErrorMessage>{erros.value}</ErrorMessage>}
            </InputGroup>
          </FormSectionSide>
          <FormSection>
            <InputGroup>
              <Label htmlFor="tipoViagem">Tipo de Viagem</Label>
              <Select
                id="tipoViagem"
                name="tipoViagem"
                value={dadosFormulario.tipoViagem}
                onChange={handleInputChange}
              >
                <option value="fretamento_aeroporto">
                  Fretamento Aeroporto
                </option>
                <option value="ida_e_volta_mg">Viagem Ida e Volta - MG</option>
                <option value="somente_ida_mg">Viagem Somente Ida - MG</option>
                <option value="ida_e_volta_fora_mg">
                  Viagem Ida e Volta - Fora de MG
                </option>
                <option value="somente_ida_fora_mg">
                  Viagem Somente Ida - Fora de MG
                </option>
                <option value="rota_colaboradores">
                  Rota de Colaboradores
                </option>
              </Select>
            </InputGroup>
            {mostraPercursoIda && (
              <>
                <SectionTitle>Percurso de Ida</SectionTitle>
                <InputRow>
                  <InputGroup>
                    <Label htmlFor="startDate">Data de Início</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={dadosFormulario.startDate}
                      onChange={handleInputChange}
                      hasError={!!erros.startDate}
                    />
                    {erros.startDate && (
                      <ErrorMessage>{erros.startDate}</ErrorMessage>
                    )}
                  </InputGroup>
                  <InputGroup>
                    <Label htmlFor="startTime">Hora Saída</Label>
                    <Input
                      id="startTime"
                      name="startTime"
                      type="time"
                      value={dadosFormulario.startTime}
                      onChange={handleInputChange}
                      hasError={!!erros.startTime}
                    />
                    {erros.startTime && (
                      <ErrorMessage>{erros.startTime}</ErrorMessage>
                    )}
                  </InputGroup>
                </InputRow>
                <InputGroup>
                  <Label htmlFor="startLocation">Descrição (Ida)</Label>
                  <Textarea
                    id="startLocation"
                    name="startLocation"
                    value={dadosFormulario.startLocation}
                    onChange={handleInputChange}
                  />
                </InputGroup>
              </>
            )}
            {mostraPercursoVolta && (
              <>
                <SectionTitle>Percurso de Volta</SectionTitle>
                <InputRow>
                  <InputGroup>
                    <Label htmlFor="endDate">Data de Retorno</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={dadosFormulario.endDate}
                      onChange={handleInputChange}
                      hasError={!!erros.endDate}
                    />
                    {erros.endDate && (
                      <ErrorMessage>{erros.endDate}</ErrorMessage>
                    )}
                  </InputGroup>
                  <InputGroup>
                    <Label htmlFor="endTime">Hora Volta</Label>
                    <Input
                      id="endTime"
                      name="endTime"
                      type="time"
                      value={dadosFormulario.endTime}
                      onChange={handleInputChange}
                      hasError={!!erros.endTime}
                    />
                    {erros.endTime && (
                      <ErrorMessage>{erros.endTime}</ErrorMessage>
                    )}
                  </InputGroup>
                </InputRow>
                <InputGroup>
                  <Label htmlFor="endLocation">Descrição (Volta)</Label>
                  <Textarea
                    id="endLocation"
                    name="endLocation"
                    value={dadosFormulario.endLocation}
                    onChange={handleInputChange}
                  />
                </InputGroup>
              </>
            )}
            {isRota && (
              <InputGroup>
                <SectionTitle>Veículos e Horários da Rota</SectionTitle>
                {dadosFormulario.rota.map((itemRota, veiculoIndex) => (
                  <RotaVeiculoBloco key={veiculoIndex}>
                    <LabelContainer>
                      <Label>Veículo</Label>
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
                    <Select
                      value={itemRota.veiculoId}
                      onChange={(e) => handleRotaVeiculoChange(veiculoIndex, e)}
                    >
                      <option value="">Selecione</option>
                      {vehiclesData.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.model}
                        </option>
                      ))}
                    </Select>
                    <Label>Horários do Veículo</Label>
                    {itemRota.horarios.map((horario, horarioIndex) => (
                      <RotaHorarioContainer key={horarioIndex}>
                        <InputGroup>
                          <Label>Início</Label>
                          <Input
                            type="time"
                            name="inicio"
                            value={horario.inicio}
                            onChange={(e) =>
                              handleHorarioRotaChange(
                                veiculoIndex,
                                horarioIndex,
                                e
                              )
                            }
                          />
                        </InputGroup>
                        <InputGroup>
                          <Label>Fim</Label>
                          <Input
                            type="time"
                            name="fim"
                            value={horario.fim}
                            onChange={(e) =>
                              handleHorarioRotaChange(
                                veiculoIndex,
                                horarioIndex,
                                e
                              )
                            }
                          />
                        </InputGroup>
                        {horarioIndex > 0 && (
                          <Button
                            variant="danger"
                            style={{ alignSelf: "flex-end" }}
                            type="button"
                            onClick={() =>
                              removerHorario(veiculoIndex, horarioIndex)
                            }
                          >
                            &times;
                          </Button>
                        )}
                      </RotaHorarioContainer>
                    ))}
                    <Button
                      variant="primary"
                      type="button"
                      onClick={() => adicionarHorario(veiculoIndex)}
                    >
                      + Adicionar Horário
                    </Button>
                  </RotaVeiculoBloco>
                ))}
                <Button
                  variant="primary"
                  type="button"
                  onClick={adicionarVeiculoRota}
                  style={{ marginTop: "1rem" }}
                >
                  + Adicionar Veículo à Rota
                </Button>
              </InputGroup>
            )}
            {isEditing && (
              <div
                style={{
                  marginTop: "auto",
                  paddingTop: "1rem",
                  borderTop: "1px solid #eee",
                }}
              >
                <Button
                  variant="danger"
                  type="button"
                  onClick={handleExcluirClick}
                >
                  Excluir Viagem
                </Button>
              </div>
            )}
          </FormSection>
        </FormGrid>

        <ModalFooter>
          <Button
            variant="secondary"
            type="button"
            onClick={() => navigate("/")}
          >
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Salvar
          </Button>
        </ModalFooter>
      </FormContainer>
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmarExclusao}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir permanentemente a reserva "${dadosFormulario.title}"?`}
      />
    </>
  );
}
