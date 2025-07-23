import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useParams, useLocation, useOutletContext } from "react-router-dom";
import { isAxiosError } from "axios";

// Componentes UI reutilizáveis (ajustar caminhos se necessário)
import {
  FormContainer, // Usado SectionTitle diretamente aqui também
} from "../../../components/ui/Form";
import { ConfirmationModal } from "../../../components/ConfirmationModal";

// Services da API (tipagem e acesso aos endpoints)
import {
  viagemService,
  type Viagem,
  type CadastroViagemData,
  type UpdateViagemData,
  type TipoViagemEnum,
  type HorarioItemRota,
} from "../../../services/viagemService";
import { veiculoService, type Vehicle } from "../../../services/veiculoService";
import {
  motoristaService,
  type Driver,
} from "../../../services/motoristaService";

// Sub-componentes do formulário (ajustar caminhos se necessário)
import { PercursoViagem } from "./sub-formularios/PercursoViagem";
import { RotaColaboradoresForm } from "./sub-formularios/RotaColaboradoresForm";
import { BotaoExcluirViagem } from "./sub-formularios/BotaoExcluirViagem";
import { FormularioLateralViagem } from "./sub-formularios/FormularioLateralViagem";
import { SelecaoTipoViagem } from "./sub-formularios/SelecaoTipoViagem";

// Styled Components (mantidos os que encapsulam a estrutura geral do formulário)
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

// Tipos para o Contexto
interface FormContextType {
  onSuccess: () => void;
  onExcluirViagem: (id: number) => void;
  viagem?: Viagem;
}

// NOVA TIPAGEM PARA O ESTADO DO FORMULÁRIO DO FRONTEND
// Reflete a estrutura atual do ItemRotaColaborador no Backend (horarioInicio e horarioFim diretos)
export interface ViagemFormState {
  title: string;
  clientName: string;
  telefone: string;
  valor: string;
  tipoViagem: TipoViagemEnum;
  startLocation: string; // Obrigatório no form
  endLocation: string; // Obrigatório no form
  startDate: string; // Manter como string vazia para ROTA_COLABORADORES
  startTime: string; // Manter como string vazia para ROTA_COLABORADORES
  endDate: string; // Manter como string vazia para ROTA_COLABORADORES
  endTime: string; // Manter como string vazia para ROTA_COLABORADORES

  rota: {
    veiculoId: string;
    motoristaId: string;
    horarios: HorarioItemRota[]; // CADA ITEM DE ROTA TEM SUA LISTA DE HORÁRIOS COM DATAS
  }[];
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
    rota: [
      {
        veiculoId: "",
        motoristaId: "",
        horarios: [{ dataInicio: "", inicio: "", dataFim: "", fim: "" }], // <-- CORREÇÃO: Inicialização com datas nos horários aninhados
      },
    ],
    status: "AGENDADA", // Status padrão para nova viagem
  });

  const [erros, setErros] = useState<{ [key: string]: string }>({});
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isPrePopulatedFromBudget, setIsPrePopulatedFromBudget] =
    useState<boolean>(false);

  // Efeito para carregar as listas de veículos e motoristas
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

  // Efeito para preencher o formulário em modo edição ou com dados do orçamento
  useEffect(() => {
    if (isEditing && viagem) {
      // Modo Edição - Preenche com dados da viagem existente
      const rotaParaFormulario =
        viagem.tipoViagem === "ROTA_COLABORADORES" && viagem.itensRota
          ? viagem.itensRota.map((item) => ({
              veiculoId: String(item.veiculoId),
              motoristaId: String(item.motoristaId),
              // CORREÇÃO: Mapear a LISTA DE HORÁRIOS COMPLETA, incluindo dataInicio/dataFim
              horarios:
                item.horarios && item.horarios.length > 0
                  ? item.horarios.map((h) => ({
                      dataInicio: h.dataInicio || "",
                      inicio: h.inicio || "",
                      dataFim: h.dataFim || "",
                      fim: h.fim || "",
                    }))
                  : [{ dataInicio: "", inicio: "", dataFim: "", fim: "" }], // Fallback se a lista estiver vazia
            }))
          : [
              {
                veiculoId: "",
                motoristaId: "",
                horarios: [
                  { dataInicio: "", inicio: "", dataFim: "", fim: "" },
                ],
              },
            ];

      setDadosFormulario({
        title: viagem.title,
        clientName: viagem.clientName || "",
        telefone: viagem.telefone || "",
        valor: String(viagem.valor || ""),
        tipoViagem: viagem.tipoViagem,
        startDate: viagem.startDate || "", // Garante string vazia se undefined/null
        startTime: viagem.startTime || "", // Garante string vazia se undefined/null
        startLocation: viagem.startLocation || "",
        endDate: viagem.endDate || "", // Garante string vazia se undefined/null
        endTime: viagem.endTime || "", // Garante string vazia se undefined/null
        endLocation: viagem.endLocation || "",
        rota: rotaParaFormulario,
        status: viagem.status,
      });
      setVeiculoIdSelecionado(String(viagem.veiculoId || ""));
      setMotoristaIdSelecionado(String(viagem.motoristaId || ""));
      setIsPrePopulatedFromBudget(false);
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
        tipoViagem: dadosDoOrcamento.tipoViagemOrcamento || "IDA_E_VOLTA_MG",
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
        rota: [
          {
            veiculoId: "",
            motoristaId: "",
            horarios: [{ dataInicio: "", inicio: "", dataFim: "", fim: "" }], // <-- CORREÇÃO: Inicialização com datas nos horários aninhados
          },
        ],
        status: "AGENDADA",
      });
      setVeiculoIdSelecionado("");
      setMotoristaIdSelecionado("");
      setIsPrePopulatedFromBudget(true);
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
        rota: [
          {
            veiculoId: "",
            motoristaId: "",
            horarios: [{ dataInicio: "", inicio: "", dataFim: "", fim: "" }], // <-- CORREÇÃO: Inicialização com datas nos horários aninhados
          },
        ],
        status: "AGENDADA",
      });
      setVeiculoIdSelecionado("");
      setMotoristaIdSelecionado("");
      setIsPrePopulatedFromBudget(false);
    }
  }, [isEditing, viagem, location.state]);

  // Efeito para autogerar descrições de percurso baseadas no tipo de viagem
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
      case "ROTA_COLABORADORES":
        textoIda = "Ponto de partida da rota.";
        textoVolta = "Ponto final da rota.";
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

  // Funções de Manipulação de Eventos
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

  // Funções para gerenciamento de rota de colaboradores
  const handleRotaVeiculoChange = (
    veiculoIndex: number,
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const novaRota = [...dadosFormulario.rota];
    novaRota[veiculoIndex].veiculoId = event.target.value;
    setDadosFormulario((prev) => ({ ...prev, rota: novaRota }));
  };

  const handleRotaMotoristaChange = (
    veiculoIndex: number,
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const novaRota = [...dadosFormulario.rota];
    novaRota[veiculoIndex].motoristaId = event.target.value;
    setDadosFormulario((prev) => ({ ...prev, rota: novaRota }));
  };

  const adicionarVeiculoRota = () => {
    setDadosFormulario((prev) => ({
      ...prev,
      rota: [
        ...prev.rota,
        {
          veiculoId: "",
          motoristaId: "",
          horarios: [{ dataInicio: "", inicio: "", dataFim: "", fim: "" }],
        }, // Inicializacao com datas
      ],
    }));
  };

  const removerVeiculoRota = (veiculoIndex: number) => {
    const novaRota = dadosFormulario.rota.filter(
      (_, index) => index !== veiculoIndex
    );
    setDadosFormulario((prev) => ({ ...prev, rota: novaRota }));
  };

  const adicionarHorario = (veiculoIndex: number) => {
    setDadosFormulario((prev) => {
      const novaRota = [...prev.rota];
      novaRota[veiculoIndex].horarios.push({
        dataInicio: "",
        inicio: "",
        dataFim: "",
        fim: "",
      });
      return { ...prev, rota: novaRota };
    });
  };

  const removerHorario = (veiculoIndex: number, horarioIndex: number) => {
    setDadosFormulario((prev) => {
      const novaRota = [...prev.rota];
      novaRota[veiculoIndex].horarios = novaRota[veiculoIndex].horarios.filter(
        (_, index) => index !== horarioIndex
      );
      // Garante que haja sempre ao menos um horário, para não quebrar a UI
      if (novaRota[veiculoIndex].horarios.length === 0) {
        novaRota[veiculoIndex].horarios.push({
          dataInicio: "",
          inicio: "",
          dataFim: "",
          fim: "",
        });
      }
      return { ...prev, rota: novaRota };
    });
  };

  // Alteração para lidar com horarioInicio e horarioFim diretos
  const handleHorarioChange = (
    veiculoIndex: number,
    horarioIndex: number,
    field: "dataInicio" | "inicio" | "dataFim" | "fim", // Novos fields
    value: string
  ) => {
    const novaRota = [...dadosFormulario.rota];
    novaRota[veiculoIndex].horarios[horarioIndex][field] = value;
    setDadosFormulario((prev) => ({ ...prev, rota: novaRota }));
  };

  // Validação do Formulário
  const validate = useCallback(() => {
    const novosErros: { [key: string]: string } = {};

    // --- Validações de Campos Gerais da Viagem ---
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
      // --- Validações para Tipos de Viagem que NÃO são "Rota de Colaboradores" ---
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
        const start = new Date(dadosFormulario.startDate + "T00:00:00");
        const end = new Date(dadosFormulario.endDate + "T00:00:00");
        if (end < start) {
          novosErros.endDate =
            "A data de retorno não pode ser anterior à data de início.";
        }
      }

      // Validação de horário de saída vs. retorno no mesmo dia
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
    } else {
      // --- Validações específicas para "ROTA_COLABORADORES" ---
      // Validações para as datas e horas gerais da rota
      if (!dadosFormulario.startDate) {
        novosErros.startDate = "A data de início da rota é obrigatória.";
      }
      if (!dadosFormulario.startTime) {
        novosErros.startTime = "A hora de início da rota é obrigatória.";
      }
      if (!dadosFormulario.endDate) {
        novosErros.endDate = "A data de fim da rota é obrigatória.";
      }
      if (!dadosFormulario.endTime) {
        novosErros.endTime = "A hora de fim da rota é obrigatória.";
      }
      // Validação de datas para que endDate não seja anterior a startDate para a rota geral
      if (dadosFormulario.startDate && dadosFormulario.endDate) {
        const start = new Date(dadosFormulario.startDate + "T00:00:00");
        const end = new Date(dadosFormulario.endDate + "T00:00:00");
        if (end < start) {
          novosErros.endDate =
            "A data de fim da rota não pode ser anterior à data de início da rota.";
        }
      }
      // Validação de horário de início vs. fim no mesmo dia para a rota geral
      if (
        dadosFormulario.startDate &&
        dadosFormulario.startTime &&
        dadosFormulario.endDate &&
        dadosFormulario.endTime &&
        dadosFormulario.startDate === dadosFormulario.endDate
      ) {
        if (dadosFormulario.startTime >= dadosFormulario.endTime) {
          novosErros.endTime =
            "A hora de fim da rota deve ser posterior à hora de início da rota no mesmo dia.";
        }
      }

      // Validações para os itens da rota
      if (dadosFormulario.rota.length === 0) {
        novosErros.rota = "Adicione ao menos um veículo à rota.";
      } else {
        dadosFormulario.rota.forEach((itemRota, idx) => {
          if (!itemRota.veiculoId) {
            novosErros[
              `rota[${idx}].veiculoId`
            ] = `Selecione o veículo da rota ${idx + 1}.`;
          }
          if (!itemRota.motoristaId) {
            novosErros[
              `rota[${idx}].motoristaId`
            ] = `Selecione o motorista da rota ${idx + 1}.`;
          }

          // Validação para os horários aninhados de cada item da rota
          if (itemRota.horarios.length === 0) {
            novosErros[
              `rota[${idx}].horarios`
            ] = `Adicione ao menos um período de horário para o veículo ${
              idx + 1
            }.`;
          } else {
            itemRota.horarios.forEach((horario, hIdx) => {
              if (!horario.dataInicio) {
                novosErros[
                  `rota[${idx}].horarios[${hIdx}].dataInicio`
                ] = `Data de início do horário é obrigatória para o período ${
                  hIdx + 1
                } do veículo ${idx + 1}.`;
              }
              if (!horario.inicio) {
                novosErros[
                  `rota[${idx}].horarios[${hIdx}].inicio`
                ] = `Hora de início do horário é obrigatória para o período ${
                  hIdx + 1
                } do veículo ${idx + 1}.`;
              }
              if (!horario.dataFim) {
                novosErros[
                  `rota[${idx}].horarios[${hIdx}].dataFim`
                ] = `Data de fim do horário é obrigatória para o período ${
                  hIdx + 1
                } do veículo ${idx + 1}.`;
              }
              if (!horario.fim) {
                novosErros[
                  `rota[${idx}].horarios[${hIdx}].fim`
                ] = `Hora de fim do horário é obrigatória para o período ${
                  hIdx + 1
                } do veículo ${idx + 1}.`;
              }

              // Validação de datas/horários dentro do próprio período do horário
              if (
                horario.dataInicio &&
                horario.inicio &&
                horario.dataFim &&
                horario.fim
              ) {
                const startDateTime = new Date(
                  `${horario.dataInicio}T${horario.inicio}:00`
                );
                const endDateTime = new Date(
                  `${horario.dataFim}T${horario.fim}:00`
                );

                if (endDateTime <= startDateTime) {
                  novosErros[`rota[${idx}].horarios[${hIdx}].fim`] =
                    "A data/hora de fim do período deve ser posterior à data/hora de início.";
                }
              }
            });
          }
        });
      }
    }

    const isIdaEVolta =
      dadosFormulario.tipoViagem.includes("IDA_E_VOLTA") ||
      dadosFormulario.tipoViagem === "FRETAMENTO_AEROPORTO";
    if (isIdaEVolta && !isRota) {
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

    let dadosParaApi: CadastroViagemData | UpdateViagemData;

    if (dadosFormulario.tipoViagem === "ROTA_COLABORADORES") {
      dadosParaApi = {
        title: dadosFormulario.title.trim(),
        clientName: dadosFormulario.clientName.trim(),
        telefone: dadosFormulario.telefone,
        valor: parseFloat(dadosFormulario.valor || "0"),
        startLocation: dadosFormulario.startLocation.trim(),
        endLocation: dadosFormulario.endLocation.trim(),
        startDate: dadosFormulario.startDate,
        startTime: dadosFormulario.startTime,
        endDate: dadosFormulario.endDate,
        endTime: dadosFormulario.endTime,
        status: dadosFormulario.status,
        tipoViagem: dadosFormulario.tipoViagem,
        itensRota: dadosFormulario.rota.map((item) => ({
          id: undefined,
          veiculoId: parseInt(item.veiculoId),
          motoristaId: parseInt(item.motoristaId),
          horarios: item.horarios.map((h) => ({
            dataInicio: h.dataInicio, // ENVIAR DATAS E HORAS DO OBJETO HORÁRIO
            inicio: h.inicio,
            dataFim: h.dataFim,
            fim: h.fim,
          })),
        })),
        veiculoId: undefined,
        motoristaId: undefined,
      };
    } else {
      dadosParaApi = {
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
        itensRota: [],
      };
    }

    console.log("Enviando para API:", dadosParaApi);

    if (dadosParaApi.tipoViagem !== "ROTA_COLABORADORES") {
      if (!dadosParaApi.veiculoId || !dadosParaApi.motoristaId) {
        alert(
          "Por favor, selecione ao menos um veículo e um motorista para este tipo de viagem."
        );
        return;
      }
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

  // Lógicas de Renderização Condicional
  const isRota = dadosFormulario.tipoViagem === "ROTA_COLABORADORES";

  return (
    <>
      <FormContainer
        id={isEditing ? `form-editar-viagem-${tripId}` : "form-nova-viagem"}
        onSubmit={handleSubmit}
      >
        <FormGrid>
          {/* Coluna Lateral - Dados Principais */}
          <FormularioLateralViagem
            dadosFormulario={dadosFormulario}
            erros={erros}
            isEditing={isEditing}
            isRota={isRota}
            listaVeiculos={listaVeiculos}
            listaMotoristas={listaMotoristas}
            veiculoIdSelecionado={veiculoIdSelecionado}
            motoristaIdSelecionado={motoristaIdSelecionado}
            onInputChange={handleInputChange}
            onVeiculoChange={(e) => setVeiculoIdSelecionado(e.target.value)}
            onMotoristaChange={(e) => setMotoristaIdSelecionado(e.target.value)}
          />

          {/* Coluna Principal - Dados da Viagem e Rota */}
          <FormSection>
            <SelecaoTipoViagem
              tipoViagem={dadosFormulario.tipoViagem}
              onInputChange={handleInputChange}
            />

            {/* Percurso de Ida e Volta - Exibido para tipos de viagem que não são rota */}
            {!isRota && (
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
            )}

            {isRota && (
              <RotaColaboradoresForm
                rota={dadosFormulario.rota}
                listaVeiculos={listaVeiculos}
                listaMotoristas={listaMotoristas}
                erros={erros}
                adicionarVeiculoRota={adicionarVeiculoRota}
                removerVeiculoRota={removerVeiculoRota}
                handleRotaVeiculoChange={handleRotaVeiculoChange}
                handleRotaMotoristaChange={handleRotaMotoristaChange}
                handleHorarioChange={handleHorarioChange}
                adicionarHorario={adicionarHorario}
                removerHorario={removerHorario}
              />
            )}

            {/* Botão de Excluir Viagem - Apenas em modo edição */}
            {isEditing && <BotaoExcluirViagem onClick={handleExcluirClick} />}
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
