import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useOutletContext, useParams, useLocation } from "react-router-dom";
import { ConfirmationModal } from "../../../components/ConfirmationModal";

import { TipoViagem } from "../../../services/viagemService";

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
import { viagemService, type Viagem } from "../../../services/viagemService";
import { veiculoService, type Vehicle } from "../../../services/veiculoService";
import {
  motoristaService,
  type Driver,
} from "../../../services/motoristaService";

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 30% 1fr;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
`;

const FormSectionSide = styled.div`
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

const FormSection = styled.div`
  padding: 1rem 0 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-height: calc(90vh - 180px);
  overflow-y: auto;

  @media (max-width: 768px) {
    margin-top: 1rem;
    gap: 1rem;
    padding: 1rem 0;
    border-top: 1px solid #e9ecef;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  color: #343a40;
  font-weight: 600;
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e9ecef;

  @media (max-width: 768px) {
    border: none;
    padding: 0;
  }
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
  onSuccess: () => void;
  onExcluirViagem: (id: number) => void;
  viagem?: Viagem;
}

export function FormularioNovaViagem() {
  const { tripId } = useParams();
  const { onSuccess, onExcluirViagem, viagem } =
    useOutletContext<FormContextType>();
  const isEditing = !!tripId;
  const location = useLocation();

  const [listaVeiculos, setListaVeiculos] = useState<Vehicle[]>([]);
  const [listaMotoristas, setListaMotoristas] = useState<Driver[]>([]);

  const [dadosFormulario, setDadosFormulario] = useState({
    title: "",
    clientName: "",
    telefone: "",
    value: "",
    tipo: TipoViagem.FRETAMENTO_AEROPORTO,
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

  const [isPrePopulatedFromBudget, setIsPrePopulatedFromBudget] =
    useState(false);

  useEffect(() => {
    const carregarListas = async () => {
      try {
        const [veiculosData, motoristasData] = await Promise.all([
          veiculoService.listar(),
          motoristaService.listar(),
        ]);
        setListaVeiculos(veiculosData.filter((v) => v.status === "ATIVO"));
        setListaMotoristas(motoristasData.filter((m) => m.status === "ATIVO"));
      } catch (err) {
        console.error("Erro ao carregar listas para o formulário", err);
      }
    };
    carregarListas();
  }, []);

  const [erros, setErros] = useState<{ [key: string]: string }>({});
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    if (isEditing && viagem) {
      setDadosFormulario((prev) => ({
        ...prev,
        title: viagem.title,
        startDate: viagem.startDate,
        startTime: viagem.startTime,
        endDate: viagem.endDate,
        endTime: viagem.endTime,
        clientName: viagem.clientName || "",
        telefone: viagem.telefone || "",
        value: viagem.valor ? String(viagem.valor) : "",
        startLocation: viagem.startLocation || "",
        endLocation: viagem.endLocation || "",
        veiculos: [{ id: String(viagem.veiculoId || "") }],
        motoristas: [{ id: String(viagem.motoristaId || "") }],
        tipo: viagem.tipo || TipoViagem.IDA_E_VOLTA_MG,
      }));
      setIsPrePopulatedFromBudget(false);
      return;
    }

    if (location.state?.dadosDoOrcamento) {
      const { dadosDoOrcamento } = location.state;

      setDadosFormulario((prev) => ({
        ...prev,
        title: `Viagem de ${dadosDoOrcamento.nomeCliente} - ${dadosDoOrcamento.origem} para ${dadosDoOrcamento.destino}`,
        clientName: dadosDoOrcamento.nomeCliente || "",
        telefone: dadosDoOrcamento.telefone || "",
        value: dadosDoOrcamento.valorTotal
          ? String(dadosDoOrcamento.valorTotal.toFixed(2))
          : "",
        tipo: dadosDoOrcamento.tipoViagemOrcamento || TipoViagem.IDA_E_VOLTA_MG,
        startLocation:
          dadosDoOrcamento.descricaoIdaOrcamento ||
          dadosDoOrcamento.origem ||
          "",
        endLocation:
          dadosDoOrcamento.descricaoVoltaOrcamento ||
          dadosDoOrcamento.destino ||
          "",
        paradas: dadosDoOrcamento.paradas || "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        veiculos: [{ id: "" }],
        motoristas: [{ id: "" }],
      }));
      setIsPrePopulatedFromBudget(true);
      return;
    }

    if (!isEditing && !location.state?.dadosDoOrcamento) {
      setDadosFormulario((prev) => ({
        ...prev,
        title: "",
        clientName: "",
        telefone: "",
        value: "",
        tipo: TipoViagem.IDA_E_VOLTA_MG,
        startDate: "",
        startTime: "",
        startLocation: "",
        endDate: "",
        endTime: "",
        endLocation: "",
        veiculos: [{ id: "" }],
        motoristas: [{ id: "" }],
        rota: [{ veiculoId: "", horarios: [{ inicio: "", fim: "" }] }],
      }));
      setIsPrePopulatedFromBudget(false);
    }
  }, [isEditing, viagem, location]);

  useEffect(() => {
    if (isEditing || isPrePopulatedFromBudget) return;

    let textoIda = "";
    let textoVolta = "";

    switch (dadosFormulario.tipo) {
      case TipoViagem.FRETAMENTO_AEROPORTO:
        textoIda =
          "Buscar passageiros em [ENDEREÇO] e levar ao Aeroporto de Confins.";
        textoVolta =
          "Buscar passageiros no Aeroporto de Confins e levar para [ENDEREÇO].";
        break;

      case TipoViagem.IDA_E_VOLTA_MG:
        textoIda = "Percurso de ida para [CIDADE-DESTINO].";
        textoVolta = "Percurso de volta de [CIDADE-DESTINO].";
        break;

      case TipoViagem.SOMENTE_IDA_MG:
        textoIda = "Percurso somente de ida para [CIDADE-DESTINO].";
        textoVolta = "";
        break;

      case TipoViagem.IDA_E_VOLTA_FORA_MG:
        textoIda =
          "Percurso ida e volta saindo de [CIDADE-INICIAL] para [CIDADE-DESTINO].";
        textoVolta =
          "Volta do percurso saindo de [CIDADE-INICIAL] para [CIDADE-DESTINO].";
        break;

      case TipoViagem.SOMENTE_IDA_FORA_MG:
        textoIda =
          "Percurso somente ida saindo de [CIDADE-INICIAL] para [CIDADE-DESTINO].";
        textoVolta = "";
        break;

      case TipoViagem.ROTA_COLABORADORES:
        textoIda = "";
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
  }, [dadosFormulario.tipo, isEditing, isPrePopulatedFromBudget]);

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

    const isRota = dadosFormulario.tipo === TipoViagem.ROTA_COLABORADORES;

    if (!isRota) {
      if (!dadosFormulario.startDate)
        novosErros.startDate = "Data de início é obrigatória.";
      if (!dadosFormulario.startTime)
        novosErros.startTime = "Hora de saída é obrigatória.";

      const veiculosValidos = dadosFormulario.veiculos.filter((v) => v.id);
      if (veiculosValidos.length === 0) {
        novosErros.veiculos = "Selecione ao menos um veículo.";
      }

      const motoristasValidos = dadosFormulario.motoristas.filter((m) => m.id);
      if (motoristasValidos.length === 0) {
        novosErros.motoristas = "Selecione ao menos um motorista.";
      }
    }

    const isIdaEVolta = [
      TipoViagem.FRETAMENTO_AEROPORTO,
      TipoViagem.IDA_E_VOLTA_MG,
      TipoViagem.IDA_E_VOLTA_FORA_MG,
    ].includes(dadosFormulario.tipo);

    if (isIdaEVolta) {
      if (!dadosFormulario.endDate)
        novosErros.endDate = "Data de retorno é obrigatória.";
      if (!dadosFormulario.endTime)
        novosErros.endTime = "Hora de volta é obrigatória.";
    }

    return novosErros;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const errosDeValidacao = validate();
    if (Object.keys(errosDeValidacao).length > 0) {
      setErros(errosDeValidacao);
      return;
    }
    setErros({});

    const veiculoIds = dadosFormulario.veiculos
      .map((v) => parseInt(v.id, 10))
      .filter((id) => !isNaN(id) && id > 0);

    const motoristaIds = dadosFormulario.motoristas
      .map((m) => parseInt(m.id, 10))
      .filter((id) => !isNaN(id) && id > 0);

    const dadosParaApi = {
      title: dadosFormulario.title,
      clientName: dadosFormulario.clientName,
      telefone: dadosFormulario.telefone,
      valor: parseFloat(dadosFormulario.value || "0"),
      startLocation: dadosFormulario.startLocation,
      endLocation: dadosFormulario.endLocation,
      startDate: dadosFormulario.startDate,
      startTime: dadosFormulario.startTime,
      endDate: dadosFormulario.endDate,
      endTime: dadosFormulario.endTime,
      tipo: dadosFormulario.tipo,
      veiculoIds: veiculoIds,
      motoristaIds: motoristaIds,
    };

    try {
      if (isEditing && tripId) {
        await viagemService.editar(parseInt(tripId), dadosParaApi);
      } else {
        await viagemService.adicionar(dadosParaApi);
      }
      alert("Viagem salva com sucesso!");
      onSuccess();
    } catch (error) {
      alert((error as Error).message);
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

  const isRota = dadosFormulario.tipo === TipoViagem.ROTA_COLABORADORES;

  const mostraPercursoVolta = [
    TipoViagem.FRETAMENTO_AEROPORTO,
    TipoViagem.IDA_E_VOLTA_MG,
    TipoViagem.IDA_E_VOLTA_FORA_MG,
  ].includes(dadosFormulario.tipo);

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
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="Título da Reserva"
                value={dadosFormulario.title}
                onChange={handleInputChange}
                hasError={!!erros.title}
              />
              {erros.title && <ErrorMessage>{erros.title}</ErrorMessage>}
            </InputGroup>
            <InputGroup>
              <SectionTitle>Dados Cliente</SectionTitle>
              <Input
                id="clientName"
                name="clientName"
                type="text"
                placeholder="Nome Cliente"
                value={dadosFormulario.clientName}
                onChange={handleInputChange}
                hasError={!!erros.clientName}
              />
              {erros.clientName && (
                <ErrorMessage>{erros.clientName}</ErrorMessage>
              )}
              <Input
                id="telefone"
                name="telefone"
                placeholder="Telefone Cliente"
                value={dadosFormulario.telefone}
                onChange={handleInputChange}
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </InputGroup>
            {!isRota && (
              <InputGroup>
                <SectionTitle>Veículos</SectionTitle>
                {dadosFormulario.veiculos.map((veiculo, index) => (
                  <div key={index}>
                    <LabelContainer>
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
                      {listaVeiculos.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.model} ({v.plate})
                        </option>
                      ))}
                    </Select>
                  </div>
                ))}
                {dadosFormulario.veiculos.length === 0 && (
                  <Button
                    variant="primary"
                    type="button"
                    onClick={() => addToList("veiculos")}
                  >
                    + Adicionar Veículo
                  </Button>
                )}
              </InputGroup>
            )}

            <InputGroup>
              <SectionTitle>Motoristas</SectionTitle>
              {dadosFormulario.motoristas.map((motorista, index) => (
                <div key={index}>
                  <LabelContainer>
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
                    {listaMotoristas.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nome}
                      </option>
                    ))}
                  </Select>
                </div>
              ))}
              {dadosFormulario.motoristas.length === 0 && (
                <Button
                  variant="primary"
                  type="button"
                  onClick={() => addToList("motoristas")}
                >
                  + Adicionar Motorista
                </Button>
              )}
            </InputGroup>
            <InputGroup>
              <SectionTitle>Valores</SectionTitle>
              <Input
                id="value"
                name="value"
                type="number"
                placeholder="R$ Valor do Serviço"
                value={dadosFormulario.value}
                onChange={handleInputChange}
                hasError={!!erros.value}
              />
              {erros.value && <ErrorMessage>{erros.value}</ErrorMessage>}
            </InputGroup>
          </FormSectionSide>
          <FormSection>
            <InputGroup>
              <SectionTitle>Dados da Viagem</SectionTitle>
              <Select
                value={dadosFormulario.tipo}
                onChange={(e) =>
                  setDadosFormulario((prev) => ({
                    ...prev,
                    tipo: e.target.value as TipoViagem,
                  }))
                }
              >
                <option value={TipoViagem.FRETAMENTO_AEROPORTO}>
                  Fretamento Aeroporto
                </option>
                <option value={TipoViagem.IDA_E_VOLTA_MG}>
                  Ida e volta (MG)
                </option>
                <option value={TipoViagem.SOMENTE_IDA_MG}>
                  Somente ida (MG)
                </option>
                <option value={TipoViagem.IDA_E_VOLTA_FORA_MG}>
                  Ida e volta (fora de MG)
                </option>
                <option value={TipoViagem.SOMENTE_IDA_FORA_MG}>
                  Somente ida (fora de MG)
                </option>
                <option value={TipoViagem.ROTA_COLABORADORES}>
                  Rota Colaboradores
                </option>
              </Select>
            </InputGroup>
            {!isRota && (
              <>
                <SectionTitle>Percurso de Ida</SectionTitle>
                <InputRow>
                  <InputGroup>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      placeholder="Data de Início"
                      value={dadosFormulario.startDate}
                      onChange={handleInputChange}
                      hasError={!!erros.startDate}
                    />
                    {erros.startDate && (
                      <ErrorMessage>{erros.startDate}</ErrorMessage>
                    )}
                  </InputGroup>
                  <InputGroup>
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
                      {listaVeiculos.map((v) => (
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
