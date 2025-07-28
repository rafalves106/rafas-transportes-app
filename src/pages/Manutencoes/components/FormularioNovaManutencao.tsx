import { useState, useEffect } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import {
  manutencaoService,
  type Maintenance,
} from "../../../services/manutencaoService";
import { veiculoService, type Vehicle } from "../../../services/veiculoService";

import { Button } from "../../../components/ui/Button";

import {
  FormContainer,
  InputGroup,
  Select,
  Input,
  ErrorMessage,
  Label,
} from "../../../components/ui/Form";

import { InputRow } from "../../../components/ui/Layout";

import { AutocompleteInput } from "../components/AutocompleteInput";

type MaintenanceStatus = "Agendada" | "Realizada";

type FormState = Omit<
  Maintenance,
  "id" | "veiculoDescricao" | "veiculoId" | "currentKm" | "proximaKm" | "cost"
> & {
  veiculoId: number | string;
  kmManutencao: string;
  proximaKm: string;
  cost: string;
};

interface FormContextType {
  onSuccess: () => void;
  onExcluir: (id: number) => void;
  manutencao?: Maintenance;
}

const commonMaintenanceTitles = [
  "Troca de Óleo e Filtro de Óleo",
  "Troca de Filtro de Ar do Motor",
  "Troca de Filtro de Combustível",
  "Rodízio de Pneus",
  "Alinhamento e Balanceamento",
  "Troca de Pastilhas de Freio Dianteiras",
  "Troca de Pastilhas de Freio Traseiras",
  "Troca de Correia Dentada",
  "Revisão Geral de 10.000 km",
  "Revisão Geral de 20.000 km",
  "Revisão Geral de 40.000 km",
  "Substituição de Velas de Ignição",
  "Limpeza de Bicos Injetores",
  "Troca de Fluido de Freio",
  "Troca de Líquido de Arrefecimento",
  "Verificação de Suspensão",
  "Inspeção de Freios",
  "Troca de Amortecedores",
  "Manutenção do Sistema de Ar Condicionado",
  "Verificação de Bateria",
  "Troca de Lâmpadas (Faróis/Lanternas)",
  "Verificação de Palhetas do Limpador de Para-brisa",
  "Inspeção de Embreagem",
  "Troca de Óleo do Câmbio",
  "Manutenção da Transmissão",
  "Verificação de Rolamentos de Roda",
];

export function FormularioNovaManutencao() {
  const { maintenanceId } = useParams();
  const { onSuccess, onExcluir, manutencao } =
    useOutletContext<FormContextType>();
  const [listaDeVeiculos, setListaDeVeiculos] = useState<Vehicle[]>([]);
  const isEditing = !!maintenanceId;

  const [veiculoSelecionadoKmAtual, setVeiculoSelecionadoKmAtual] = useState<
    number | null
  >(null);

  const [dados, setDados] = useState<FormState>({
    title: "",
    veiculoId: 0,
    type: "Preventiva",
    date: "",
    cost: "",
    status: "Agendada",
    kmManutencao: "",
    proximaKm: "",
  });

  const [erros, setErros] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const todosOsVeiculos = await veiculoService.listar();
        const veiculosAtivos = todosOsVeiculos.filter(
          (v) => v.status.toUpperCase() === "ATIVO"
        );
        setListaDeVeiculos(veiculosAtivos);
      } catch (error) {
        console.error("ERRO CRÍTICO AO BUSCAR VEÍCULOS:", error);
      }
    };
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (isEditing && manutencao) {
      const dadosDoFormulario: FormState = {
        title: manutencao.title,
        veiculoId: manutencao.veiculoId,
        type: manutencao.type,
        date: manutencao.date || "",
        cost: String(manutencao.cost),
        status: manutencao.status,
        kmManutencao:
          manutencao.currentKm !== undefined
            ? String(manutencao.currentKm)
            : "",
        proximaKm:
          manutencao.proximaKm !== undefined
            ? String(manutencao.proximaKm)
            : "",
      };
      setDados(dadosDoFormulario);
    }
  }, [maintenanceId, isEditing, manutencao]);

  useEffect(() => {
    const veiculoEncontrado = listaDeVeiculos.find(
      (v) => v.id === dados.veiculoId
    );
    if (veiculoEncontrado) {
      setVeiculoSelecionadoKmAtual(veiculoEncontrado.currentKm || null);
    } else {
      setVeiculoSelecionadoKmAtual(null);
    }
  }, [dados.veiculoId, listaDeVeiculos]);

  useEffect(() => {
    if (
      dados.status === "Realizada" &&
      dados.veiculoId !== 0 &&
      dados.veiculoId !== "" &&
      (dados.kmManutencao === "" || parseFloat(dados.kmManutencao) === 0) &&
      veiculoSelecionadoKmAtual !== null
    ) {
      setDados((prev) => ({
        ...prev,
        kmManutencao: String(veiculoSelecionadoKmAtual),
      }));
    }
  }, [
    dados.status,
    dados.veiculoId,
    dados.kmManutencao,
    veiculoSelecionadoKmAtual,
  ]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "veiculoId") {
      setDados((prev) => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
    } else if (name === "cost") {
      setDados((prev) => ({ ...prev, [name]: value }));
    } else if (name === "kmManutencao" || name === "proximaKm") {
      setDados((prev) => ({ ...prev, [name]: value }));
    } else if (name === "status") {
      const newStatus = value as MaintenanceStatus;
      setDados((prev) => ({
        ...prev,
        [name]: newStatus,
        kmManutencao: "",
        proximaKm: "",
      }));
    } else if (name === "type") {
      setDados((prev) => ({
        ...prev,
        [name]: value as "Preventiva" | "Corretiva",
      }));
    } else {
      setDados((prev) => ({ ...prev, [name]: value }));
    }

    if (erros[name]) {
      setErros((prevErros) => ({ ...prevErros, [name]: "" }));
    }
  };

  const validate = () => {
    const novosErros: { [key: string]: string } = {};
    if (!dados.title.trim()) novosErros.title = "O título é obrigatório.";
    if (!dados.veiculoId || dados.veiculoId === 0)
      novosErros.veiculoId = "É obrigatório selecionar um veículo.";

    if (dados.status === "Realizada" && !dados.date) {
      novosErros.date = "A data é obrigatória para manutenções realizadas.";
    } else if (dados.status === "Agendada" && dados.date) {
      const inputDate = new Date(dados.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (inputDate < today) {
        novosErros.date =
          "Para manutenção 'Agendada', a data deve ser no presente ou futuro.";
      }
    }

    const costNum = parseFloat(String(dados.cost));
    if (dados.status === "Realizada") {
      if (isNaN(costNum) || costNum <= 0)
        novosErros.cost = "O custo deve ser um número positivo.";
    } else {
      if (dados.cost && isNaN(costNum)) {
        novosErros.cost = "O custo, se informado, deve ser um número.";
      }
    }

    const kmManutencaoNum = parseFloat(String(dados.kmManutencao));
    const proximaKmNum = parseFloat(String(dados.proximaKm));

    if (dados.status === "Realizada") {
      if (
        !dados.kmManutencao ||
        isNaN(kmManutencaoNum) ||
        kmManutencaoNum <= 0
      ) {
        novosErros.kmManutencao =
          "A KM da manutenção realizada é obrigatória e deve ser positiva.";
      }
      if (dados.proximaKm && (isNaN(proximaKmNum) || proximaKmNum <= 0)) {
        novosErros.proximaKm = "A próxima KM deve ser um número positivo.";
      }
      if (dados.kmManutencao && dados.proximaKm) {
        // eslint-disable-next-line no-empty
        if (isNaN(kmManutencaoNum) || isNaN(proximaKmNum)) {
        } else if (proximaKmNum <= kmManutencaoNum) {
          novosErros.proximaKm =
            "A próxima KM deve ser superior à KM da manutenção realizada.";
        }
      }
    } else if (dados.status === "Agendada") {
      if (
        !dados.kmManutencao ||
        isNaN(kmManutencaoNum) ||
        kmManutencaoNum <= 0
      ) {
        novosErros.kmManutencao =
          "A KM ideal para a troca é obrigatória para manutenção agendada e deve ser positiva.";
      }
      if (dados.proximaKm) {
        novosErros.proximaKm =
          "Próxima KM não deve ser informada para manutenção agendada.";
      }
    }

    return novosErros;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errosDeValidacao = validate();
    if (Object.keys(errosDeValidacao).length > 0) {
      setErros(errosDeValidacao);
      alert("Por favor, corrija os erros no formulário.");
      return;
    }
    setErros({});

    const dadosParaApi = {
      title: dados.title,
      veiculoId: parseInt(String(dados.veiculoId), 10),
      type: dados.type,
      date: dados.date,
      cost: parseFloat(String(dados.cost)),
      status: dados.status as MaintenanceStatus,
      currentKm: dados.kmManutencao
        ? parseInt(String(dados.kmManutencao), 10)
        : undefined,
      proximaKm:
        dados.status === "Realizada" && dados.proximaKm
          ? parseInt(String(dados.proximaKm), 10)
          : undefined,
    };

    try {
      if (isEditing && maintenanceId) {
        await manutencaoService.editar(parseInt(maintenanceId), dadosParaApi);
      } else {
        await manutencaoService.adicionar(dadosParaApi);
      }

      alert("Operação realizada com sucesso!");
      onSuccess();
    } catch (error) {
      const errorMsg = (error as Error).message;

      console.log("MENSAGEM DE ERRO RECEBIDA DO BACKEND:", errorMsg);

      if (
        errorMsg.toLowerCase().includes("data") ||
        errorMsg.toLowerCase().includes("date")
      ) {
        setErros({ date: errorMsg });
      } else {
        alert(errorMsg);
      }
    }
  };

  const handleExcluir = () => {
    if (!maintenanceId) return;
    onExcluir(parseInt(maintenanceId));
  };

  return (
    <FormContainer
      id={isEditing ? `form-editar-mnt-${maintenanceId}` : "form-nova-mnt"}
      onSubmit={handleSubmit}
    >
      <InputRow>
        <AutocompleteInput
          id="title"
          name="title"
          label="Título da Manutenção"
          placeholder="Título da Manutenção"
          value={dados.title}
          onChange={handleInputChange}
          suggestionsList={commonMaintenanceTitles}
          hasError={!!erros.title}
          errorMessage={erros.title}
        />
      </InputRow>

      <InputRow>
        <InputGroup>
          <Select
            id="veiculoId"
            name="veiculoId"
            value={dados.veiculoId}
            onChange={handleInputChange}
            hasError={!!erros.veiculoId}
          >
            <option value={0}>Veículo</option>
            {listaDeVeiculos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.model} ({v.plate})
              </option>
            ))}
          </Select>
          {erros.veiculoId && <ErrorMessage>{erros.veiculoId}</ErrorMessage>}
        </InputGroup>

        <InputGroup>
          <Input
            id="date"
            name="date"
            type="date"
            value={dados.date}
            onChange={handleInputChange}
            hasError={!!erros.date}
          />
          {erros.date && <ErrorMessage>{erros.date}</ErrorMessage>}
        </InputGroup>
      </InputRow>

      <InputRow>
        <InputGroup>
          <Input
            id="cost"
            name="cost"
            type="text"
            placeholder="Custo (R$)"
            value={dados.cost}
            onChange={handleInputChange}
            hasError={!!erros.cost}
          />
          {erros.cost && <ErrorMessage>{erros.cost}</ErrorMessage>}
        </InputGroup>

        <InputGroup>
          <Select
            id="type"
            name="type"
            value={dados.type}
            onChange={handleInputChange}
          >
            <option value="Preventiva">Preventiva</option>
            <option value="Corretiva">Corretiva</option>
          </Select>
        </InputGroup>

        <InputGroup>
          <Select
            id="status"
            name="status"
            value={dados.status}
            onChange={handleInputChange}
          >
            <option value="Agendada">Agendada</option>
            <option value="Realizada">Realizada</option>
          </Select>
        </InputGroup>
      </InputRow>

      {dados.status === "Agendada" && (
        <InputGroup>
          <Input
            id="kmManutencao"
            name="kmManutencao"
            type="text"
            placeholder="KM Ideal para Troca"
            value={dados.kmManutencao}
            onChange={handleInputChange}
            hasError={!!erros.kmManutencao}
          />
          {erros.kmManutencao && (
            <ErrorMessage>{erros.kmManutencao}</ErrorMessage>
          )}
        </InputGroup>
      )}

      {dados.status === "Realizada" && (
        <>
          {veiculoSelecionadoKmAtual !== null && (
            <InputGroup>
              <Label>KM Atual do Veículo</Label>
              <Input
                id="veiculoKmAtual"
                name="veiculoKmAtual"
                type="text"
                value={`${veiculoSelecionadoKmAtual} km`}
                disabled
              />
            </InputGroup>
          )}

          <InputGroup>
            <Input
              id="kmManutencao"
              name="kmManutencao"
              type="text"
              placeholder="KM da Manutenção Realizada"
              value={dados.kmManutencao}
              onChange={handleInputChange}
              hasError={!!erros.kmManutencao}
            />
            {erros.kmManutencao && (
              <ErrorMessage>{erros.kmManutencao}</ErrorMessage>
            )}
          </InputGroup>
        </>
      )}

      {dados.status === "Realizada" && (
        <InputGroup>
          <Input
            id="proximaKm"
            name="proximaKm"
            type="text"
            placeholder="(Opcional) Próxima Manutenção (km)"
            value={dados.proximaKm}
            onChange={handleInputChange}
            hasError={!!erros.proximaKm}
          />
          {erros.proximaKm && <ErrorMessage>{erros.proximaKm}</ErrorMessage>}
        </InputGroup>
      )}

      {isEditing && (
        <Button
          style={{ marginBottom: "1.5rem" }}
          variant="danger"
          type="button"
          onClick={handleExcluir}
        >
          Excluir Manutenção
        </Button>
      )}
    </FormContainer>
  );
}
