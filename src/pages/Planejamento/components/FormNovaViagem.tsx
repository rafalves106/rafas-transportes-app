import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useParams, useLocation, useOutletContext } from "react-router-dom";
import { isAxiosError } from "axios";
import { FormContainer } from "../../../components/ui/Form";
import { ConfirmationModal } from "../../../components/ConfirmationModal";
import {
  viagemService,
  type Viagem,
  type CadastroViagemData,
  type UpdateViagemData,
  type TipoViagemEnum,
} from "../../../services/viagemService";
import { veiculoService, type Vehicle } from "../../../services/veiculoService";
import {
  motoristaService,
  type Driver,
} from "../../../services/motoristaService";
import { PercursoViagem } from "./sub-formularios/PercursoViagem";
import { BotaoExcluirViagem } from "./sub-formularios/BotaoExcluirViagem";
import { FormularioLateralViagem } from "./sub-formularios/FormularioLateralViagem";
import { SelecaoTipoViagem } from "./sub-formularios/SelecaoTipoViagem";
const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 30% 1fr;
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
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
interface FormContextType {
  onSuccess: () => void;
  onExcluirViagem: (id: number) => void;
  viagem?: Viagem;
}
export interface ViagemFormState {
  title: string;
  clientName: string;
  telefone: string;
  valor: string;
  tipoViagem: TipoViagemEnum;
  startLocation: string;
  endLocation: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  status: "AGENDADA" | "EM_CURSO" | "FINALIZADA" | "CANCELADA";
}
export function FormularioNovaViagem() {
  const { tripId } = useParams();
  const { onSuccess, onExcluirViagem, viagem } =
    useOutletContext<FormContextType>();
  const isEditing = !!tripId;
  const location = useLocation();
  const [listaVeiculos, setListaVeiculos] = useState<Vehicle[]>([]);
  const [listaMotoristas, setListaMotoristas] = useState<Driver[]>([]);
  const [veiculoIdSelecionado, setVeiculoIdSelecionado] = useState<string>("");
  const [motoristaIdSelecionado, setMotoristaIdSelecionado] =
    useState<string>("");
  const [dadosFormulario, setDadosFormulario] = useState<ViagemFormState>({
    title: "",
    clientName: "",
    telefone: "",
    valor: "",
    tipoViagem: "IDA_E_VOLTA_MG",
    startDate: "",
    startTime: "",
    startLocation: "",
    endDate: "",
    endTime: "",
    endLocation: "",
    status: "AGENDADA",
  });
  const [erros, setErros] = useState<{ [key: string]: string }>({});
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isPrePopulatedFromBudget, setIsPrePopulatedFromBudget] =
    useState<boolean>(false);
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
        console.error("Erro ao carregar listas para o formulário:", err);
        alert("Não foi possível carregar as listas de veículos ou motoristas.");
      }
    };
    carregarListas();
  }, []);
  useEffect(() => {
    if (isEditing && viagem) {
      setDadosFormulario({
        title: viagem.title,
        clientName: viagem.clientName || "",
        telefone: viagem.telefone || "",
        valor: String(viagem.valor || ""),
        tipoViagem: viagem.tipoViagem,
        startDate: viagem.startDate || "",
        startTime: viagem.startTime || "",
        startLocation: viagem.startLocation || "",
        endDate: viagem.endDate || "",
        endTime: viagem.endTime || "",
        endLocation: viagem.endLocation || "",
        status: viagem.status,
      });
      setVeiculoIdSelecionado(String(viagem.veiculoId || ""));
      setMotoristaIdSelecionado(String(viagem.motoristaId || ""));
      setIsPrePopulatedFromBudget(false);
    } else if (location.state?.dadosDoOrcamento) {
      const { dadosDoOrcamento } = location.state;
      setDadosFormulario({
        title: `Viagem de ${dadosDoOrcamento.nomeCliente} - ${dadosDoOrcamento.origem} para ${dadosDoOrcamento.destino}`,
        clientName: dadosDoOrcamento.nomeCliente || "",
        telefone: dadosDoOrcamento.telefone || "",
        valor: dadosDoOrcamento.valorTotal
          ? String(dadosDoOrcamento.valorTotal.toFixed(2))
          : "",
        tipoViagem: dadosDoOrcamento.tipoViagemOrcamento || "IDA_E_VOLTA_MG",
        startDate: "",
        startTime: "",
        startLocation:
          dadosDoOrcamento.descricaoIdaOrcamento ||
          dadosDoOrcamento.origem ||
          "",
        endDate: "",
        endTime: "",
        endLocation:
          dadosDoOrcamento.descricaoVoltaOrcamento ||
          dadosDoOrcamento.destino ||
          "",
        status: "AGENDADA",
      });
      setVeiculoIdSelecionado("");
      setMotoristaIdSelecionado("");
      setIsPrePopulatedFromBudget(true);
    } else {
      setDadosFormulario({
        title: "",
        clientName: "",
        telefone: "",
        valor: "",
        tipoViagem: "IDA_E_VOLTA_MG",
        startDate: "",
        startTime: "",
        startLocation: "",
        endDate: "",
        endTime: "",
        endLocation: "",
        status: "AGENDADA",
      });
      setVeiculoIdSelecionado("");
      setMotoristaIdSelecionado("");
      setIsPrePopulatedFromBudget(false);
    }
  }, [isEditing, viagem, location.state]);
  useEffect(() => {
    if (isEditing || isPrePopulatedFromBudget) return;
    let textoIda = "";
    let textoVolta = "";
    switch (dadosFormulario.tipoViagem) {
      case "FRETAMENTO_AEROPORTO":
        textoIda =
          "Buscar passageiros em [ENDEREÇO] e levar ao Aeroporto de Confins.";
        textoVolta =
          "Buscar passageiros no Aeroporto de Confins e levar para [ENDEREÇO].";
        break;
      case "IDA_E_VOLTA_MG":
        textoIda = "Percurso de ida para [CIDADE-DESTINO].";
        textoVolta = "Percurso de volta de [CIDADE-DESTINO].";
        break;
      case "SOMENTE_IDA_MG":
        textoIda = "Percurso somente de ida para [CIDADE-DESTINO].";
        textoVolta = "Não aplicável para somente ida.";
        break;
      case "IDA_E_VOLTA_FORA_MG":
        textoIda =
          "Percurso ida e volta saindo de [CIDADE-INICIAL] para [CIDADE-DESTINO].";
        textoVolta =
          "Volta do percurso saindo de [CIDADE-INICIAL] para [CIDADE-DESTINO].";
        break;
      case "SOMENTE_IDA_FORA_MG":
        textoIda =
          "Percurso somente ida saindo de [CIDADE-INICIAL] para [CIDADE-DESTINO].";
        textoVolta = "Não aplicável para somente ida.";
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
  }, [dadosFormulario.tipoViagem, isEditing, isPrePopulatedFromBudget]);
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
  const validate = useCallback(() => {
    const novosErros: { [key: string]: string } = {};
    if (!dadosFormulario.title.trim()) {
      novosErros.title = "O título é obrigatório.";
    }
    if (!dadosFormulario.clientName.trim()) {
      novosErros.clientName = "O nome do cliente é obrigatório.";
    }
    const valorNumerico = parseFloat(dadosFormulario.valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      novosErros.valor = "O valor deve ser um número positivo.";
    }
    if (!veiculoIdSelecionado) {
      novosErros.veiculoIdSelecionado = "Selecione um veículo.";
    }
    if (!motoristaIdSelecionado) {
      novosErros.motoristaIdSelecionado = "Selecione um motorista.";
    }
    if (!dadosFormulario.startDate) {
      novosErros.startDate = "A data de início é obrigatória.";
    }
    if (!dadosFormulario.startTime) {
      novosErros.startTime = "A hora de saída é obrigatória.";
    }
    if (dadosFormulario.startDate && dadosFormulario.endDate) {
      const start = new Date(dadosFormulario.startDate + "T00:00:00");
      const end = new Date(dadosFormulario.endDate + "T00:00:00");
      if (end < start) {
        novosErros.endDate =
          "A data de retorno não pode ser anterior à data de início.";
      }
    }
    if (
      dadosFormulario.startDate &&
      dadosFormulario.startTime &&
      dadosFormulario.endDate &&
      dadosFormulario.endTime &&
      dadosFormulario.startDate === dadosFormulario.endDate
    ) {
      if (dadosFormulario.startTime >= dadosFormulario.endTime) {
        novosErros.endTime =
          "A hora de retorno deve ser posterior à hora de saída no mesmo dia.";
      }
    }
    const isIdaEVolta =
      dadosFormulario.tipoViagem.includes("IDA_E_VOLTA") ||
      dadosFormulario.tipoViagem === "FRETAMENTO_AEROPORTO";
    if (isIdaEVolta) {
      if (!dadosFormulario.endDate) {
        novosErros.endDate =
          "A data de retorno é obrigatória para viagens de ida e volta.";
      }
      if (!dadosFormulario.endTime) {
        novosErros.endTime =
          "A hora de volta é obrigatória para viagens de ida e volta.";
      }
    }
    return novosErros;
  }, [dadosFormulario, veiculoIdSelecionado, motoristaIdSelecionado]);
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const errosDeValidacao = validate();
    if (Object.keys(errosDeValidacao).length > 0) {
      setErros(errosDeValidacao);
      alert("Por favor, corrija os erros no formulário.");
      console.error("Erros de validação:", errosDeValidacao);
      return;
    }
    setErros({});
    const dadosParaApi: CadastroViagemData | UpdateViagemData = {
      title: dadosFormulario.title.trim(),
      clientName: dadosFormulario.clientName.trim(),
      telefone: dadosFormulario.telefone,
      valor: parseFloat(dadosFormulario.valor || "0"),
      startLocation: dadosFormulario.startLocation.trim(),
      endLocation: dadosFormulario.endLocation.trim(),
      veiculoId: parseInt(veiculoIdSelecionado || "0"),
      motoristaId: parseInt(motoristaIdSelecionado || "0"),
      startDate: dadosFormulario.startDate,
      startTime: dadosFormulario.startTime,
      endDate: dadosFormulario.endDate,
      endTime: dadosFormulario.endTime,
      status: dadosFormulario.status,
      tipoViagem: dadosFormulario.tipoViagem,
    };
    console.log("Enviando para API:", dadosParaApi);
    if (!dadosParaApi.veiculoId || !dadosParaApi.motoristaId) {
      alert(
        "Por favor, selecione ao menos um veículo e um motorista para esta viagem."
      );
      return;
    }
    try {
      if (isEditing && tripId) {
        await viagemService.editar(parseInt(tripId), dadosParaApi);
      } else {
        await viagemService.adicionar(dadosParaApi as CadastroViagemData);
      }
      alert("Viagem salva com sucesso!");
      onSuccess();
    } catch (error) {
      let errorMessage = "Ocorreu um erro desconhecido ao salvar a viagem.";
      if (isAxiosError(error)) {
        console.error("Erro Axios completo:", error);
        if (error.response) {
          console.error("Dados do erro da API:", error.response.data);
          console.error("Status do erro da API:", error.response.status);
          if (error.response.data && typeof error.response.data === "string") {
            errorMessage = error.response.data;
          } else if (
            error.response.data &&
            typeof error.response.data === "object" &&
            error.response.data.message
          ) {
            errorMessage = error.response.data.message;
          } else if (error.response.status === 403) {
            errorMessage =
              "Acesso negado. Por favor, verifique suas credenciais.";
          } else {
            errorMessage = `Erro do servidor: ${error.response.status} - ${
              error.response.statusText || "Erro desconhecido"
            }`;
          }
        } else if (error.request) {
          errorMessage =
            "Erro de rede: Não foi possível conectar ao servidor. Verifique sua conexão.";
        } else {
          errorMessage = `Erro na requisição: ${error.message}`;
        }
      } else if (error instanceof Error) {
        errorMessage = `Erro: ${error.message}`;
      }
      alert(errorMessage);
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
  return (
    <>
      <FormContainer
        id={isEditing ? `form-editar-viagem-${tripId}` : "form-nova-viagem"}
        onSubmit={handleSubmit}
      >
        <FormGrid>
          {}
          <FormularioLateralViagem
            dadosFormulario={dadosFormulario}
            erros={erros}
            isEditing={isEditing}
            listaVeiculos={listaVeiculos}
            listaMotoristas={listaMotoristas}
            veiculoIdSelecionado={veiculoIdSelecionado}
            motoristaIdSelecionado={motoristaIdSelecionado}
            onInputChange={handleInputChange}
            onVeiculoChange={(e) => setVeiculoIdSelecionado(e.target.value)}
            onMotoristaChange={(e) => setMotoristaIdSelecionado(e.target.value)}
          />
          {}
          <FormSection>
            <SelecaoTipoViagem
              tipoViagem={dadosFormulario.tipoViagem}
              onInputChange={handleInputChange}
            />
            {}
            <PercursoViagem
              startDate={dadosFormulario.startDate}
              startTime={dadosFormulario.startTime}
              startLocation={dadosFormulario.startLocation}
              endDate={dadosFormulario.endDate}
              endTime={dadosFormulario.endTime}
              endLocation={dadosFormulario.endLocation}
              tipoViagem={dadosFormulario.tipoViagem}
              erros={erros}
              onInputChange={handleInputChange}
            />
            {}
            {isEditing && <BotaoExcluirViagem onClick={handleExcluirClick} />}
          </FormSection>
        </FormGrid>
      </FormContainer>
      {}
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
