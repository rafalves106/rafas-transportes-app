import { useState, useEffect } from "react";
import { useParams, useOutletContext } from "react-router-dom";

import { AxiosError } from "axios";

import type { Vehicle } from "../../../services/veiculoService";
import { Button } from "../../../components/ui/Button";

import {
  FormContainer,
  Label,
  Input,
  Select,
  ErrorMessage,
  InputGroup,
} from "../../../components/ui/Form";
import type { BackendErrorResponse } from "@/services/manutencaoService";

interface FormContextType {
  onAdicionar: (dados: Omit<Vehicle, "id">) => Promise<void>;
  onEditar: (id: number, dados: Omit<Vehicle, "id">) => Promise<void>;
  onExcluir: (id: number) => void;
  veiculo?: Vehicle;
}

export function FormularioNovoVeiculo() {
  const { vehicleId } = useParams();
  const { onAdicionar, onEditar, onExcluir, veiculo } =
    useOutletContext<FormContextType>();
  const isEditing = !!vehicleId;

  const [dados, setDados] = useState<
    Omit<Vehicle, "id" | "currentKm"> & { currentKm: string }
  >({
    model: "",
    plate: "",
    status: "Ativo",
    currentKm: "",
  });

  const [erros, setErros] = useState<{ [key: string]: string }>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setDados((prev) => ({ ...prev, [name]: value }));

    if (erros[name]) {
      setErros((prevErros) => ({ ...prevErros, [name]: "" }));
    }
  };

  useEffect(() => {
    if (isEditing && veiculo) {
      setDados({
        model: veiculo.model,
        plate: veiculo.plate,
        status: veiculo.status,
        currentKm: String(veiculo.currentKm || ""),
      });
    }
  }, [vehicleId, isEditing, veiculo]);

  const validate = () => {
    const novosErros: { [key: string]: string } = {};

    if (!dados.model.trim()) {
      novosErros.model = "O modelo é obrigatório.";
    }
    if (!dados.plate.trim()) {
      novosErros.plate = "A placa é obrigatória.";
    }

    const kmNum = parseFloat(dados.currentKm);
    if (isNaN(kmNum) || kmNum <= 0) {
      novosErros.currentKm = "A quilometragem deve ser um número positivo.";
    } else if (isEditing && veiculo && kmNum < veiculo.currentKm) {
      novosErros.currentKm =
        "A nova quilometragem não pode ser menor que a atual.";
    }

    if (!dados.status) {
      novosErros.status = "O status é obrigatório.";
    }

    return novosErros;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errosDeValidacao = validate();
    if (Object.keys(errosDeValidacao).length > 0) {
      setErros(errosDeValidacao);
      alert("Por favor, corrija os erros do formulário.");
      return;
    }
    setErros({});

    const dadosParaEnvio = {
      model: dados.model,
      plate: dados.plate,
      status: dados.status,
      currentKm: dados.currentKm ? parseInt(dados.currentKm, 10) : 0,
    };

    try {
      if (isEditing && vehicleId) {
        await onEditar(parseInt(vehicleId), dadosParaEnvio);
      } else {
        await onAdicionar(dadosParaEnvio);
      }
      alert("Operação realizada com sucesso!");
    } catch (error) {
      const axiosError = error as AxiosError<BackendErrorResponse>;
      const backendErrorMessage =
        axiosError.response?.data?.message || axiosError.message;

      console.log(
        "MENSAGEM DE ERRO RECEBIDA DO BACKEND (VEICULO):",
        backendErrorMessage
      );

      if (backendErrorMessage) {
        if (
          backendErrorMessage.toLowerCase().includes("placa") &&
          backendErrorMessage.toLowerCase().includes("cadastrada")
        ) {
          setErros((prevErros) => ({
            ...prevErros,
            plate: backendErrorMessage,
          }));
        } else if (
          backendErrorMessage.toLowerCase().includes("quilometragem") &&
          backendErrorMessage.toLowerCase().includes("maior que a atual")
        ) {
          setErros((prevErros) => ({
            ...prevErros,
            currentKm: backendErrorMessage,
          }));
        } else if (
          backendErrorMessage.toLowerCase().includes("modelo é obrigatório")
        ) {
          setErros((prevErros) => ({
            ...prevErros,
            model: backendErrorMessage,
          }));
        } else {
          alert(backendErrorMessage);
        }
      } else {
        alert("Ocorreu um erro desconhecido ao salvar o veículo.");
      }
    }
  };

  const handleExcluir = () => {
    if (!vehicleId) return;

    if (
      window.confirm(
        "Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita."
      )
    ) {
      onExcluir(parseInt(vehicleId));
    }
  };

  return (
    <FormContainer
      id={isEditing ? `form-editar-veiculo-${vehicleId}` : "form-novo-veiculo"}
      onSubmit={handleSubmit}
    >
      <InputGroup>
        <Label htmlFor="model">Modelo:</Label>
        <Input
          id="model"
          name="model"
          placeholder="Modelo:"
          value={dados.model}
          onChange={handleInputChange}
          hasError={!!erros.model}
        />
        {erros.model && <ErrorMessage>{erros.model}</ErrorMessage>}
      </InputGroup>

      <InputGroup>
        <Label htmlFor="plate">Placa:</Label>
        <Input
          id="plate"
          name="plate"
          placeholder="Placa:"
          value={dados.plate}
          onChange={handleInputChange}
          hasError={!!erros.plate}
        />
        {erros.plate && <ErrorMessage>{erros.plate}</ErrorMessage>}
      </InputGroup>

      <InputGroup>
        <Label htmlFor="currentKm">Quilometragem:</Label>
        <Input
          id="currentKm"
          name="currentKm"
          type="text"
          placeholder="Quilometragem Atual:"
          value={dados.currentKm}
          onChange={handleInputChange}
          hasError={!!erros.currentKm}
        />
        {erros.currentKm && <ErrorMessage>{erros.currentKm}</ErrorMessage>}
      </InputGroup>

      <InputGroup>
        <Label htmlFor="status">Status:</Label>
        <Select
          id="status"
          name="status"
          value={dados.status}
          onChange={handleInputChange}
          hasError={!!erros.status}
        >
          <option value="Ativo">Ativo</option>
          <option value="Inativo">Inativo</option>
          <option value="Em Manutenção">Em Manutenção</option>
        </Select>
        {erros.status && <ErrorMessage>{erros.status}</ErrorMessage>}
      </InputGroup>

      {isEditing && (
        <Button
          style={{ marginBottom: "1.5rem" }}
          variant="danger"
          type="button"
          onClick={handleExcluir}
        >
          Excluir Veículo
        </Button>
      )}
    </FormContainer>
  );
}
