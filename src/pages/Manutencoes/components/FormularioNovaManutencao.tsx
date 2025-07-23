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

// Tipo para o status, para evitar erro de string genérica
type MaintenanceStatus = "Agendada" | "Realizada"; // Definido aqui

// Extender FormState
type FormState = Omit<
  Maintenance,
  "id" | "veiculoDescricao" | "currentKm" | "proximaKm"
> & {
  currentKm: string;
  proximaKm: string;
};

interface FormContextType {
  onSuccess: () => void;
  onExcluir: (id: number) => void;
  manutencao?: Maintenance;
}

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
    cost: 0,
    status: "Agendada",
    currentKm: "",
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
        date: manutencao.date,
        cost: manutencao.cost,
        status: manutencao.status,
        currentKm:
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Casting condicional para garantir o tipo correto para 'status' e 'type'
    if (name === "status") {
      setDados((prev) => ({ ...prev, [name]: value as MaintenanceStatus }));
    } else if (name === "type") {
      setDados((prev) => ({
        ...prev,
        [name]: value as "Preventiva" | "Corretiva",
      }));
    } else if (
      name === "veiculoId" ||
      name === "cost" ||
      name === "currentKm" ||
      name === "proximaKm"
    ) {
      setDados((prev) => ({ ...prev, [name]: value })); // Estes já são strings ou números que o TypeScript inferirá
    } else {
      // Para os outros campos (string, como title, date, etc.)
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
    if (!dados.date) novosErros.date = "A data é obrigatória.";
    const costNum = parseFloat(String(dados.cost));
    if (isNaN(costNum) || costNum <= 0)
      novosErros.cost = "O custo deve ser um número positivo.";

    const currentKmNum = parseFloat(String(dados.currentKm));
    const proximaKmNum = parseFloat(String(dados.proximaKm));

    if (dados.currentKm && (isNaN(currentKmNum) || currentKmNum <= 0)) {
      novosErros.currentKm =
        "A quilometragem atual deve ser um número positivo.";
    }

    if (dados.proximaKm && (isNaN(proximaKmNum) || proximaKmNum <= 0)) {
      novosErros.proximaKm =
        "A próxima quilometragem deve ser um número positivo.";
    }

    if (dados.currentKm && dados.proximaKm && dados.status === "Realizada") {
      if (isNaN(currentKmNum) || isNaN(proximaKmNum)) {
        // Erro já pego acima, não sobrescrever
      } else if (proximaKmNum <= currentKmNum) {
        novosErros.proximaKm =
          "A próxima KM deve ser superior à KM atual da manutenção.";
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
      currentKm: dados.currentKm
        ? parseInt(String(dados.currentKm), 10)
        : undefined,
      proximaKm: dados.proximaKm
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

      if (dados.status === "Realizada" && dados.proximaKm) {
        const proximaKmNum = parseFloat(String(dados.proximaKm));
        if (!isNaN(proximaKmNum) && proximaKmNum > 0) {
          const dadosNovaManutencaoAgendada = {
            title: `Manutenção Agendada - ${dados.title}`,
            veiculoId: dadosParaApi.veiculoId,
            type: dados.type,
            date: "",
            cost: 0,
            status: "Agendada" as MaintenanceStatus,
            currentKm: proximaKmNum,
            proximaKm: undefined,
          };

          try {
            await manutencaoService.adicionar(dadosNovaManutencaoAgendada);
            alert("Nova manutenção agendada criada com sucesso!");
          } catch (error) {
            console.error("Erro ao criar nova manutenção agendada:", error);
            alert(
              "Erro ao criar nova manutenção agendada: " +
                (error as Error).message
            );
          }
        }
      }
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
      <InputGroup>
        <Input
          id="title"
          name="title"
          placeholder="Título da Manutenção"
          value={dados.title}
          onChange={handleInputChange}
          hasError={!!erros.title}
        />
        {erros.title && <ErrorMessage>{erros.title}</ErrorMessage>}
      </InputGroup>

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
      </InputRow>

      <InputRow>
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

        <InputGroup>
          <Input
            id="cost"
            name="cost"
            type="number"
            placeholder="Custo (R$)"
            value={dados.cost}
            onChange={handleInputChange}
            hasError={!!erros.cost}
          />
          {erros.cost && <ErrorMessage>{erros.cost}</ErrorMessage>}
        </InputGroup>
      </InputRow>

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
              id="currentKm"
              name="currentKm"
              type="number"
              placeholder="KM da Manutenção Realizada"
              value={dados.currentKm}
              onChange={handleInputChange}
              hasError={!!erros.currentKm}
            />
            {erros.currentKm && <ErrorMessage>{erros.currentKm}</ErrorMessage>}
          </InputGroup>
        </>
      )}

      {dados.status === "Realizada" && (
        <InputGroup>
          <Input
            id="proximaKm"
            name="proximaKm"
            type="number"
            placeholder="(Opcional) Próxima Manutenção (km)"
            value={dados.proximaKm}
            onChange={handleInputChange}
            hasError={!!erros.proximaKm}
          />
          {erros.proximaKm && <ErrorMessage>{erros.proximaKm}</ErrorMessage>}
        </InputGroup>
      )}

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

      <Button type="submit">Salvar Manutenção</Button>

      {isEditing && (
        <Button variant="danger" type="button" onClick={handleExcluir}>
          Excluir Manutenção
        </Button>
      )}
    </FormContainer>
  );
}
