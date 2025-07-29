import { useState, useEffect } from "react";
import { useParams, useOutletContext } from "react-router-dom";

import { AxiosError } from "axios";

import type {
  UpdateVehicleData,
  Vehicle,
} from "../../../services/veiculoService";
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
  onEditar: (id: number, dados: UpdateVehicleData) => Promise<void>;
  onExcluir: (id: number) => void;
  veiculo?: Vehicle;
}

interface FieldErrorsResponse {
  [fieldName: string]: string;
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
    status: "ATIVO",
    currentKm: "",
  });

  const [erros, setErros] = useState<{ [key: string]: string }>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === "status" && value === "Em Manutenção") {
      finalValue = "EM_MANUTENCAO";
    } else if (name === "status" && value === "Ativo") {
      finalValue = "ATIVO";
    } else if (name === "status" && value === "Inativo") {
      finalValue = "INATIVO";
    }

    setDados((prev) => ({ ...prev, [name]: finalValue }));

    if (erros[name]) {
      setErros((prevErros) => ({ ...prevErros, [name]: "" }));
    }
  };

  useEffect(() => {
    if (isEditing && veiculo) {
      setDados({
        model: veiculo.model,
        plate: veiculo.plate,
        status: veiculo.status.toUpperCase().replace(/ /g, "_"),
        currentKm: String(veiculo.currentKm || ""),
      });
    }
  }, [vehicleId, isEditing, veiculo]);

  const validatePlateFormat = (plate: string): boolean => {
    const cleanedPlate = plate.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const oldPlateRegex = /^[A-Z]{3}[0-9]{4}$/;
    const mercosulPlateRegex = /^[A-Z]{3}[0-9]{1}[A-Z]{1}[0-9]{2}$/;

    return (
      oldPlateRegex.test(cleanedPlate) || mercosulPlateRegex.test(cleanedPlate)
    );
  };

  const validate = () => {
    const novosErros: { [key: string]: string } = {};

    if (!dados.model.trim()) {
      novosErros.model = "O modelo é obrigatório.";
    }
    if (!dados.plate.trim()) {
      novosErros.plate = "A placa é obrigatória.";
    } else if (!validatePlateFormat(dados.plate)) {
      novosErros.plate = "Formato de placa inválido (Ex: ABC1234 ou ABC1D23).";
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

    const dadosParaAdicao = {
      model: dados.model,
      plate: dados.plate,
      status: dados.status,
      currentKm: dados.currentKm ? parseInt(dados.currentKm, 10) : 0,
    };

    const dadosParaEdicao: Partial<Vehicle> = {};
    if (isEditing && veiculo) {
      if (dados.model !== veiculo.model) {
        dadosParaEdicao.model = dados.model;
      }
      if (dados.plate !== veiculo.plate) {
        dadosParaEdicao.plate = dados.plate;
      }
      if (dados.status !== veiculo.status) {
        dadosParaEdicao.status = dados.status;
      }
      if (parseInt(String(dados.currentKm), 10) !== veiculo.currentKm) {
        dadosParaEdicao.currentKm = parseInt(String(dados.currentKm), 10);
      }
    }

    try {
      if (isEditing && vehicleId) {
        await onEditar(parseInt(vehicleId), dadosParaEdicao);
      } else {
        await onAdicionar(dadosParaAdicao);
      }
      alert("Operação realizada com sucesso!");
    } catch (error) {
      const axiosError = error as AxiosError<
        BackendErrorResponse | FieldErrorsResponse
      >;

      if (axiosError.response && axiosError.response.status === 400) {
        const errorData = axiosError.response.data;
        if (
          typeof errorData === "object" &&
          errorData !== null &&
          !Array.isArray(errorData) &&
          "message" in errorData
        ) {
          const backendErrorMessage = (errorData as BackendErrorResponse)
            .message;
          console.log(
            "MENSAGEM DE ERRO (BackendErrorResponse):",
            backendErrorMessage
          );
          if (
            backendErrorMessage.toLowerCase().includes("placa") &&
            (backendErrorMessage.toLowerCase().includes("cadastrada") ||
              backendErrorMessage.toLowerCase().includes("outro veículo"))
          ) {
            setErros((prevErros) => ({
              ...prevErros,
              plate: backendErrorMessage,
            }));
          } else {
            alert(backendErrorMessage);
          }
        } else if (
          typeof errorData === "object" &&
          errorData !== null &&
          !Array.isArray(errorData)
        ) {
          const fieldErrors = errorData as FieldErrorsResponse;
          console.log("ERROS DE CAMPO DO BACKEND:", fieldErrors);
          setErros(fieldErrors);
          alert("Por favor, corrija os erros no formulário.");
        } else {
          alert(String(errorData));
        }
      } else {
        const backendErrorMessage = axiosError.message;
        console.log("MENSAGEM DE ERRO GERAL (AXIOS):", backendErrorMessage);
        alert(backendErrorMessage);
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
          <option value="ATIVO">Ativo</option>
          <option value="INATIVO">Inativo</option>
          <option value="EM_MANUTENCAO">Em Manutenção</option>
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
