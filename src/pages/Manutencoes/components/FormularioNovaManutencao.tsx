import { useState, useEffect } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import { vehiclesData } from "../../../data/vehiclesData";
import type { Maintenance } from "../../../data/maintenanceData";

import {
  FormContainer,
  InputGroup,
  Label,
  Select,
  Input,
  ErrorMessage,
} from "../../../components/ui/Form";

import { RemoveButton } from "../../../components/ui/Button";

import { InputRow } from "../../../components/ui/Layout";

interface FormContextType {
  onAdicionar: (dados: Omit<Maintenance, "id">) => void;
  onEditar: (id: number, dados: Omit<Maintenance, "id">) => void;
  onExcluir: (id: number) => void;
  manutencao?: Maintenance;
}

export function FormularioNovaManutencao() {
  const { maintenanceId } = useParams();
  const { onAdicionar, onEditar, onExcluir, manutencao } =
    useOutletContext<FormContextType>();
  const isEditing = !!maintenanceId;

  const [dados, setDados] = useState<
    Omit<Maintenance, "id"> & { proximaKm: string }
  >({
    title: "",
    vehicleId: 0,
    type: "Preventiva",
    date: "",
    cost: 0,
    status: "Agendada",
    proximaKm: "",
  });

  const [erros, setErros] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isEditing && manutencao) {
      setDados({
        title: manutencao.title,
        vehicleId: manutencao.vehicleId,
        type: manutencao.type,
        date: manutencao.date,
        cost: manutencao.cost,
        status: manutencao.status,
        proximaKm: "",
      });
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
    if (!dados.vehicleId || dados.vehicleId === 0)
      novosErros.vehicleId = "É obrigatório selecionar um veículo.";
    if (!dados.date) novosErros.date = "A data é obrigatória.";
    if (dados.cost <= 0) novosErros.cost = "O custo deve ser maior que zero.";
    return novosErros;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errosDeValidacao = validate();
    if (Object.keys(errosDeValidacao).length > 0) {
      setErros(errosDeValidacao);
      return;
    }
    setErros({});

    const dadosParaSalvar = {
      ...dados,
      cost: parseFloat(String(dados.cost)) || 0,
      vehicleId: parseInt(String(dados.vehicleId)) || 0,
    };

    if (isEditing && maintenanceId) {
      onEditar(parseInt(maintenanceId), dadosParaSalvar);
    } else {
      onAdicionar(dadosParaSalvar);
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
            id="vehicleId"
            name="vehicleId"
            value={dados.vehicleId}
            onChange={handleInputChange}
            hasError={!!erros.vehicleId}
          >
            <option value={0}>Selecione um veículo</option>
            {vehiclesData.map((v) => (
              <option key={v.id} value={v.id}>
                {v.model} ({v.plate})
              </option>
            ))}
          </Select>
          {erros.vehicleId && <ErrorMessage>{erros.vehicleId}</ErrorMessage>}
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
        <RemoveButton type="button" onClick={handleExcluir}>
          Excluir Manutenção
        </RemoveButton>
      )}
    </FormContainer>
  );
}
