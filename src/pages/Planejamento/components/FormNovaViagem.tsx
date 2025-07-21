import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useParams, useLocation, useOutletContext } from "react-router-dom";
import { isAxiosError } from "axios";

// Componentes UI reutilizáveis
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
import { ConfirmationModal } from "../../../components/ConfirmationModal";

// Services da API (tipagem e acesso aos endpoints)
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

// Styled Components (Manter os que já existem e fazem sentido para o layout)
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

// Tipos para o Contexto (Permanecem os mesmos)
interface FormContextType {
  onSuccess: () => void;
  onExcluirViagem: (id: number) => void;
  viagem?: Viagem;
}

// NOVA TIPAGEM PARA O ESTADO DO FORMULÁRIO DO FRONTEND
interface ViagemFormState {
  title: string;
  clientName: string;
  telefone: string;
  valor: string; // Usar string para o input type="number"
  tipoViagem: TipoViagemEnum; // Para controlar o tipo de viagem no formulário
  startDate: string; // "YYYY-MM-DD"
  startTime: string; // "HH:MM"
  startLocation: string;
  endDate: string; // "YYYY-MM-DD"
  endTime: string; // "HH:MM"
  endLocation: string;
  // 'rota' é específica para o frontend (se for tipo "rota_colaboradores")
  rota: { veiculoId: string; horarios: { inicio: string; fim: string }[] }[];
  // status do backend, usado para edição. Para cadastro, definimos um padrão.
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

  // IDs dos veículos e motoristas selecionados
  const [veiculoIdSelecionado, setVeiculoIdSelecionado] = useState<string>("");
  const [motoristaIdSelecionado, setMotoristaIdSelecionado] =
    useState<string>("");

  // Estado do formulário com a nova tipagem
  const [dadosFormulario, setDadosFormulario] = useState<ViagemFormState>({
    title: "",
    clientName: "",
    telefone: "",
    valor: "",
    tipoViagem: "IDA_E_VOLTA_MG", // Valor padrão inicial
    startDate: "",
    startTime: "",
    startLocation: "",
    endDate: "",
    endTime: "",
    endLocation: "",
    rota: [{ veiculoId: "", horarios: [{ inicio: "", fim: "" }] }],
    status: "AGENDADA", // Status padrão para nova viagem
  });

  const [erros, setErros] = useState<{ [key: string]: string }>({});
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isPrePopulatedFromBudget, setIsPrePopulatedFromBudget] =
    useState<boolean>(false);

  // --- Efeitos de Carregamento de Dados ---

  // Efeito para carregar as listas de veículos e motoristas
  useEffect(() => {
    const carregarListas = async () => {
      try {
        const [veiculosData, motoristasData] = await Promise.all([
          veiculoService.listar(),
          motoristaService.listar(),
        ]);
        // Filtra por status "ATIVO" conforme sua lógica existente
        setListaVeiculos(veiculosData.filter((v) => v.status === "ATIVO"));
        setListaMotoristas(motoristasData.filter((m) => m.status === "ATIVO"));
      } catch (err) {
        console.error("Erro ao carregar listas para o formulário:", err);
        alert("Não foi possível carregar as listas de veículos ou motoristas.");
      }
    };
    carregarListas();
  }, []); // Executa apenas uma vez ao montar o componente

  // Efeito para preencher o formulário em modo edição ou com dados do orçamento
  useEffect(() => {
    if (isEditing && viagem) {
      // Modo Edição - Preenche com dados da viagem existente
      setDadosFormulario({
        title: viagem.title,
        clientName: viagem.clientName || "",
        telefone: viagem.telefone || "",
        valor: String(viagem.valor || ""), // Garante que seja string para o input
        // tipoViagem não existe na entidade Viagem, então defina um padrão ou o que for relevante
        // ou mantenha o valor atual do estado se não for resetar
        tipoViagem: viagem.tipoViagem, // Mantém o tipo de viagem atual ou defina um padrão
        startDate: viagem.startDate,
        startTime: viagem.startTime,
        startLocation: viagem.startLocation || "",
        endDate: viagem.endDate,
        endTime: viagem.endTime,
        endLocation: viagem.endLocation || "",
        rota: [{ veiculoId: "", horarios: [{ inicio: "", fim: "" }] }], // TODO: Preencher com dados reais da rota se houver
        status: viagem.status,
      });
      setVeiculoIdSelecionado(String(viagem.veiculoId || ""));
      setMotoristaIdSelecionado(String(viagem.motoristaId || ""));
      setIsPrePopulatedFromBudget(false); // Não é preenchido de orçamento se estiver editando
    } else if (location.state?.dadosDoOrcamento) {
      // Preenchimento a partir de Orçamento
      const { dadosDoOrcamento } = location.state;
      setDadosFormulario({
        title: `Viagem de ${dadosDoOrcamento.nomeCliente} - ${dadosDoOrcamento.origem} para ${dadosDoOrcamento.destino}`,
        clientName: dadosDoOrcamento.nomeCliente || "",
        telefone: dadosDoOrcamento.telefone || "",
        valor: dadosDoOrcamento.valorTotal
          ? String(dadosDoOrcamento.valorTotal.toFixed(2))
          : "",
        tipoViagem: dadosDoOrcamento.tipoViagemOrcamento || "ida_e_volta_mg",
        startDate: "", // Sempre limpo para o usuário preencher
        startTime: "",
        startLocation:
          dadosDoOrcamento.descricaoIdaOrcamento ||
          dadosDoOrcamento.origem ||
          "",
        endDate: "", // Sempre limpo para o usuário preencher
        endTime: "",
        endLocation:
          dadosDoOrcamento.descricaoVoltaOrcamento ||
          dadosDoOrcamento.destino ||
          "",
        rota: [{ veiculoId: "", horarios: [{ inicio: "", fim: "" }] }], // Default para rota (orçamento não tem info de rota)
        status: "AGENDADA", // Status padrão para orçamento -> viagem
      });
      setVeiculoIdSelecionado(""); // Não vem do orçamento
      setMotoristaIdSelecionado(""); // Não vem do orçamento
      setIsPrePopulatedFromBudget(true); // Marca como preenchido de orçamento
    } else {
      // Modo Novo (limpa o formulário)
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
        rota: [{ veiculoId: "", horarios: [{ inicio: "", fim: "" }] }],
        status: "AGENDADA", // Status padrão para nova viagem
      });
      setVeiculoIdSelecionado("");
      setMotoristaIdSelecionado("");
      setIsPrePopulatedFromBudget(false);
    }
  }, [isEditing, viagem, location.state]); // Dependências do useEffect

  // Efeito para autogerar descrições de percurso baseadas no tipo de viagem
  useEffect(() => {
    // Só autogera se não estiver editando e não for preenchido de orçamento
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
        textoVolta = "Não aplicável para somente ida."; // Garante que não é vazio
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
        textoVolta = "Não aplicável para somente ida."; // Garante que não é vazio
        break;
      case "ROTA_COLABORADORES": // Para rota, startLocation e endLocation são os pontos da rota
        textoIda = "Ponto de partida da rota de colaboradores.";
        textoVolta = "Ponto final da rota de colaboradores.";
        break;
      default: // Fallback caso o tipo de viagem não se encaixe
        textoIda = "";
        textoVolta = "";
        break;
    }

    setDadosFormulario((prev) => ({
      ...prev,
      startLocation: textoIda,
      endLocation: textoVolta,
    }));
  }, [dadosFormulario.tipoViagem, isEditing, isPrePopulatedFromBudget]); // Adicionadas deps para evitar loop infinito

  // --- Funções de Manipulação de Eventos ---

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setDadosFormulario((prev) => ({ ...prev, [name]: value }));
    // Limpa o erro associado ao campo quando o usuário começa a digitar
    if (erros[name]) {
      setErros((prevErros) => ({ ...prevErros, [name]: "" }));
    }
  };

  // Funções para gerenciamento de rota de colaboradores
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

  // --- Validação do Formulário ---
  // Use useCallback para memorizar a função de validação e evitar recriações desnecessárias
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

    const isRota = dadosFormulario.tipoViagem === "ROTA_COLABORADORES";

    if (!isRota) {
      // Validações para tipos de viagem que não são "rota_colaboradores"
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
      // Validação de datas para que endDate não seja anterior a startDate
      if (dadosFormulario.startDate && dadosFormulario.endDate) {
        const start = new Date(dadosFormulario.startDate + "T00:00:00"); // Adiciona T00:00:00 para evitar problemas de fuso horário
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
        dadosFormulario.startDate === dadosFormulario.endDate // Apenas se as datas forem as mesmas
      ) {
        if (dadosFormulario.startTime >= dadosFormulario.endTime) {
          // Se hora de início for igual ou depois da hora de fim
          novosErros.endTime =
            "A hora de retorno deve ser posterior à hora de saída no mesmo dia.";
        }
      }
    } else {
      // Validações específicas para "rota_colaboradores"
      if (dadosFormulario.rota.length === 0) {
        novosErros.rota = "Adicione ao menos um veículo à rota.";
      } else {
        dadosFormulario.rota.forEach((itemRota, idx) => {
          if (!itemRota.veiculoId) {
            novosErros[
              `rota[${idx}].veiculoId`
            ] = `Selecione o veículo da rota ${idx + 1}.`;
          }
          if (itemRota.horarios.length === 0) {
            novosErros[
              `rota[${idx}].horarios`
            ] = `Adicione ao menos um horário para o veículo ${idx + 1}.`;
          } else {
            itemRota.horarios.forEach((horario, hIdx) => {
              if (!horario.inicio) {
                novosErros[
                  `rota[${idx}].horarios[${hIdx}].inicio`
                ] = `Informe o horário de início do veículo ${
                  idx + 1
                }, horário ${hIdx + 1}.`;
              }
              if (!horario.fim) {
                novosErros[
                  `rota[${idx}].horarios[${hIdx}].fim`
                ] = `Informe o horário de fim do veículo ${idx + 1}, horário ${
                  hIdx + 1
                }.`;
              }
              // Opcional: validação de hora de início antes da hora de fim
              if (
                horario.inicio &&
                horario.fim &&
                horario.inicio >= horario.fim
              ) {
                // Alterado para >= para incluir horários iguais
                novosErros[`rota[${idx}].horarios[${hIdx}].fim`] =
                  "A hora de fim não pode ser anterior ou igual à hora de início.";
              }
            });
          }
        });
      }
    }

    // Validação para tipo de viagem "ida_e_volta" ou "fretamento_aeroporto"
    const isIdaEVolta =
      dadosFormulario.tipoViagem.includes("IDA_E_VOLTA") ||
      dadosFormulario.tipoViagem === "FRETAMENTO_AEROPORTO";
    if (isIdaEVolta && !isRota) {
      // Validação de retorno para ida e volta, exceto para rota
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

  // --- Funções de Submissão e Exclusão ---

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const errosDeValidacao = validate(); // Chama a validação
    if (Object.keys(errosDeValidacao).length > 0) {
      setErros(errosDeValidacao);
      alert("Por favor, corrija os erros no formulário.");
      console.error("Erros de validação:", errosDeValidacao);
      return;
    }
    setErros({}); // Limpa erros se a validação passar

    // Monta o objeto de dados para a API (CadastroViagemData ou UpdateViagemData)
    // Garante que o status seja enviado em MAIÚSCULAS
    const dadosParaApi: CadastroViagemData | UpdateViagemData = {
      title: dadosFormulario.title.trim(),
      clientName: dadosFormulario.clientName.trim(),
      telefone: dadosFormulario.telefone,
      valor: parseFloat(dadosFormulario.valor || "0"), // Converte para number
      startLocation: dadosFormulario.startLocation.trim(),
      endLocation: dadosFormulario.endLocation.trim(),
      veiculoId: parseInt(veiculoIdSelecionado || "0"), // Converte para number
      motoristaId: parseInt(motoristaIdSelecionado || "0"), // Converte para number
      startDate: dadosFormulario.startDate,
      startTime: dadosFormulario.startTime,
      endDate: dadosFormulario.endDate,
      endTime: dadosFormulario.endTime,
      status: dadosFormulario.status, // Envia o status do formulário (que já é AGENDADA por padrão)
      tipoViagem: dadosFormulario.tipoViagem,
    };

    console.log("Enviando para API:", dadosParaApi);

    try {
      if (isEditing && tripId) {
        // Modo Edição
        await viagemService.editar(parseInt(tripId), dadosParaApi);
      } else {
        // Modo Cadastro
        await viagemService.adicionar(dadosParaApi as CadastroViagemData);
      }
      alert("Viagem salva com sucesso!");
      onSuccess(); // Chama a função do contexto para atualizar a lista e fechar o modal
    } catch (error) {
      // Tratamento de erros da API (melhorado para AxiosError)
      let errorMessage = "Ocorreu um erro desconhecido ao salvar a viagem.";
      // Importar axios se ainda não estiver importado no topo do arquivo
      // import axios from "axios";
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
    if (!tripId) return; // Não deve ser chamado se não houver tripId
    onExcluirViagem(parseInt(tripId)); // Chama a função do contexto para exclusão
    setIsConfirmModalOpen(false); // Fecha o modal de confirmação
  };

  // --- Lógicas de Renderização Condicional ---
  // Essas variáveis controlam quais seções do formulário serão exibidas
  const isRota = dadosFormulario.tipoViagem === "ROTA_COLABORADORES";
  const mostraPercursoIda = [
    "IDA_E_VOLTA_MG",
    "SOMENTE_IDA_MG",
    "IDA_E_VOLTA_FORA_MG",
    "SOMENTE_IDA_FORA_MG",
    "FRETAMENTO_AEROPORTO",
  ].includes(dadosFormulario.tipoViagem);
  const mostraPercursoVolta = [
    "IDA_E_VOLTA_MG",
    "IDA_E_VOLTA_FORA_MG",
    "FRETAMENTO_AEROPORTO",
  ].includes(dadosFormulario.tipoViagem);

  return (
    <>
      <FormContainer
        id={isEditing ? `form-editar-viagem-${tripId}` : "form-nova-viagem"}
        onSubmit={handleSubmit}
      >
        <FormGrid>
          {/* Coluna Lateral - Dados Principais */}
          <FormSectionSide>
            <InputGroup>
              <SectionTitle>Dados da Reserva</SectionTitle>
              <Label htmlFor="title">Título da Reserva</Label>
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
              <Label htmlFor="clientName">Nome do Cliente</Label>
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

              <Label htmlFor="telefone">Telefone do Cliente</Label>
              <Input
                id="telefone"
                name="telefone"
                type="text"
                placeholder="Telefone Cliente"
                value={dadosFormulario.telefone}
                onChange={handleInputChange}
              />
            </InputGroup>

            {/* Veículos - Exibido se NÃO for rota_colaboradores */}
            {!isRota && (
              <InputGroup>
                <SectionTitle>Veículos</SectionTitle>
                <Label htmlFor="veiculoIdSelecionado">Veículo</Label>
                <Select
                  id="veiculoIdSelecionado"
                  value={veiculoIdSelecionado}
                  onChange={(e) => setVeiculoIdSelecionado(e.target.value)}
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
            )}

            {/* Motoristas */}
            <InputGroup>
              <SectionTitle>Motoristas</SectionTitle>
              <Label htmlFor="motoristaIdSelecionado">Motorista</Label>
              <Select
                id="motoristaIdSelecionado"
                value={motoristaIdSelecionado}
                onChange={(e) => setMotoristaIdSelecionado(e.target.value)}
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

            {/* Valores */}
            <InputGroup>
              <SectionTitle>Valores</SectionTitle>
              <Label htmlFor="valor">Valor do Serviço (R$)</Label>
              <Input
                id="valor"
                name="valor"
                type="number"
                placeholder="R$ Valor do Serviço"
                value={dadosFormulario.valor}
                onChange={handleInputChange}
                hasError={!!erros.valor}
              />
              {erros.valor && <ErrorMessage>{erros.valor}</ErrorMessage>}
            </InputGroup>

            {/* Status da Viagem (adicionado para edição) */}
            {isEditing && (
              <InputGroup>
                <SectionTitle>Status da Viagem</SectionTitle>
                <Label htmlFor="status">Status</Label>
                <Select
                  id="status"
                  name="status"
                  value={dadosFormulario.status}
                  onChange={handleInputChange}
                >
                  <option value="AGENDADA">Agendada</option>
                  <option value="EM_CURSO">Em Curso</option>
                  <option value="FINALIZADA">Finalizada</option>
                  <option value="CANCELADA">Cancelada</option>
                </Select>
              </InputGroup>
            )}
          </FormSectionSide>

          {/* Coluna Principal - Dados da Viagem e Rota */}
          <FormSection>
            <InputGroup>
              <SectionTitle>Tipo de Viagem</SectionTitle>
              <Label htmlFor="tipoViagem">Selecione o Tipo de Viagem</Label>
              <Select
                id="tipoViagem"
                name="tipoViagem"
                value={dadosFormulario.tipoViagem}
                onChange={handleInputChange}
              >
                <option value="FRETAMENTO_AEROPORTO">
                  Fretamento Aeroporto
                </option>
                <option value="IDA_E_VOLTA_MG">Viagem Ida e Volta - MG</option>
                <option value="SOMENTE_IDA_MG">Viagem Somente Ida - MG</option>
                <option value="IDA_E_VOLTA_FORA_MG">
                  Viagem Ida e Volta - Fora de MG
                </option>
                <option value="SOMENTE_IDA_FORA_MG">
                  Viagem Somente Ida - Fora de MG
                </option>
                <option value="ROTA_COLABORADORES">
                  Rota de Colaboradores
                </option>
              </Select>
            </InputGroup>

            {/* Percurso de Ida - Exibido para tipos de viagem que não são rota */}
            {mostraPercursoIda && !isRota && (
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
                    <Label htmlFor="startTime">Hora de Saída</Label>
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
                  <Label htmlFor="startLocation">Local de Início</Label>
                  <Textarea
                    id="startLocation"
                    name="startLocation"
                    placeholder="Detalhes do local de início"
                    value={dadosFormulario.startLocation}
                    onChange={handleInputChange}
                  />
                </InputGroup>
              </>
            )}

            {/* Percurso de Volta - Exibido para tipos de viagem de ida e volta que não são rota */}
            {mostraPercursoVolta && !isRota && (
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
                    <Label htmlFor="endTime">Hora de Volta</Label>
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
                  <Label htmlFor="endLocation">Local de Fim</Label>
                  <Textarea
                    id="endLocation"
                    name="endLocation"
                    placeholder="Detalhes do local de fim"
                    value={dadosFormulario.endLocation}
                    onChange={handleInputChange}
                  />
                </InputGroup>
              </>
            )}

            {/* Seção Rota de Colaboradores - Exibida apenas para tipo "rota_colaboradores" */}
            {isRota && (
              <InputGroup>
                <SectionTitle>Veículos e Horários da Rota</SectionTitle>
                {dadosFormulario.rota.map((itemRota, veiculoIndex) => (
                  <RotaVeiculoBloco key={veiculoIndex}>
                    <LabelContainer>
                      <Label htmlFor={`veiculo-rota-${veiculoIndex}`}>
                        Veículo da Rota {veiculoIndex + 1}
                      </Label>
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

                    <Label>Horários do Veículo</Label>
                    {itemRota.horarios.map((horario, horarioIndex) => (
                      <RotaHorarioContainer key={horarioIndex}>
                        <InputGroup>
                          <Label
                            htmlFor={`inicio-${veiculoIndex}-${horarioIndex}`}
                          >
                            Início
                          </Label>
                          <Input
                            id={`inicio-${veiculoIndex}-${horarioIndex}`}
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
                        <InputGroup>
                          <Label
                            htmlFor={`fim-${veiculoIndex}-${horarioIndex}`}
                          >
                            Fim
                          </Label>
                          <Input
                            id={`fim-${veiculoIndex}-${horarioIndex}`}
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
                      + Adicionar Horário
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
                  + Adicionar Veículo à Rota
                </Button>
              </InputGroup>
            )}

            {/* Botão de Excluir Viagem - Apenas em modo edição */}
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

      {/* Modal de Confirmação de Exclusão */}
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
