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
  Label,
  Select,
  Input,
  ErrorMessage,
} from "../../../components/ui/Form";

import { InputRow } from "../../../components/ui/Layout";

type FormState = Omit<Maintenance, "id" | "veiculoDescricao"> & {
  proximaKm?: string;
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

  const [dados, setDados] = useState<FormState>({
    title: "",
    veiculoId: 0,
    type: "Preventiva",
    date: "",
    cost: 0,
    status: "Agendada",
    proximaKm: "",
  });

  const [erros, setErros] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        console.log("Passo 1: Buscando veículos da API...");

        const todosOsVeiculos = await veiculoService.listar();
        console.log("Passo 2: Veículos recebidos da API:", todosOsVeiculos);

        const veiculosAtivos = todosOsVeiculos.filter(
          (v) => v.status.toUpperCase() === "ATIVO"
        );
        console.log(
          "Passo 3: Veículos após o filtro de 'Ativo':",
          veiculosAtivos
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
        proximaKm: "",
      };
      setDados(dadosDoFormulario);
    }
  }, [maintenanceId, isEditing, manutencao]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setDados((prev) => ({ ...prev, [name]: value }));
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
    if (dados.cost <= 0) novosErros.cost = "O custo deve ser maior que zero.";
    return novosErros;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errosDeValidacao = validate();
    if (Object.keys(errosDeValidacao).length > 0) {
      setErros(errosDeValidacao);
      return;
    }
    setErros({});

    const dadosParaApi = {
      title: dados.title,
      veiculoId: parseInt(String(dados.veiculoId), 10),
      type: dados.type,
      date: dados.date,
      cost: parseFloat(String(dados.cost)),
      status: dados.status,
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
      <InputGroup>
        <Label htmlFor="title">Título da Manutenção</Label>
        <Input
          id="title"
          name="title"
          value={dados.title}
          onChange={handleInputChange}
          hasError={!!erros.title}
        />
        {erros.title && <ErrorMessage>{erros.title}</ErrorMessage>}
      </InputGroup>

      <InputRow>
        <InputGroup>
          <Label htmlFor="vehicleId">Veículo</Label>
          <Select
            id="veiculoId"
            name="veiculoId"
            value={dados.veiculoId}
            onChange={handleInputChange}
            hasError={!!erros.veiculoId}
          >
            <option value={0}>Selecione um veículo</option>
            {listaDeVeiculos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.model} ({v.plate})
              </option>
            ))}
          </Select>
          {erros.veiculoId && <ErrorMessage>{erros.veiculoId}</ErrorMessage>}
        </InputGroup>

        <InputGroup>
          <Label htmlFor="type">Tipo</Label>
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
          <Label htmlFor="date">Data</Label>
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
          <Label htmlFor="cost">Custo (R$)</Label>
          <Input
            id="cost"
            name="cost"
            type="number"
            value={dados.cost}
            onChange={handleInputChange}
            hasError={!!erros.cost}
          />
          {erros.cost && <ErrorMessage>{erros.cost}</ErrorMessage>}
        </InputGroup>
      </InputRow>

      <InputGroup>
        <Label htmlFor="proximaKm">Próxima Manutenção (km)</Label>
        <Input
          id="proximaKm"
          name="proximaKm"
          type="number"
          placeholder="Opcional"
          value={dados.proximaKm}
          onChange={handleInputChange}
        />
      </InputGroup>

      <InputGroup>
        <Label htmlFor="status">Status</Label>
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

      {isEditing && (
        <Button variant="danger" type="button" onClick={handleExcluir}>
          Excluir Manutenção
        </Button>
      )}
    </FormContainer>
  );
}
