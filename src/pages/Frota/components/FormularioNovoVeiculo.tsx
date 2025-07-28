import { useState, useEffect } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import type { Vehicle } from "../../../services/veiculoService";
import { Button } from "../../../components/ui/Button";

import {
  FormContainer,
  Label,
  Input,
  Select,
} from "../../../components/ui/Form";

interface FormContextType {
  onAdicionar: (dados: Omit<Vehicle, "id">) => void;
  onEditar: (id: number, dados: Omit<Vehicle, "id">) => void;
  onExcluir: (id: number) => void;
  veiculo?: Vehicle;
}

export function FormularioNovoVeiculo() {
  const { vehicleId } = useParams();
  const { onAdicionar, onEditar, onExcluir, veiculo } =
    useOutletContext<FormContextType>();
  const isEditing = !!vehicleId;

  const [dados, setDados] = useState<
    Omit<Vehicle, "id" | "currentKm"> & { currentKm: string | number }
  >({
    model: "",
    plate: "",
    status: "Ativo",
    ano: "",
    color: "",
    renavam: "",
    currentKm: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "currentKm") {
      setDados((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setDados((prev) => ({ ...prev, [name]: value }));
    }
  };

  useEffect(() => {
    if (isEditing && veiculo) {
      setDados({
        model: veiculo.model,
        plate: veiculo.plate,
        status: veiculo.status,
        ano: veiculo.ano,
        color: veiculo.color,
        renavam: veiculo.renavam,
        currentKm: String(veiculo.currentKm || 0),
      });
    }
  }, [vehicleId, isEditing, veiculo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dadosParaEnvio = {
      ...dados,
      currentKm:
        typeof dados.currentKm === "string" && dados.currentKm !== ""
          ? parseInt(dados.currentKm, 10) || 0
          : typeof dados.currentKm === "number"
          ? dados.currentKm
          : 0,
    };

    if (isEditing) {
      onEditar(parseInt(vehicleId), dadosParaEnvio);
    } else {
      onAdicionar(dadosParaEnvio);
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
      <Input
        name="model"
        placeholder="Modelo:"
        value={dados.model}
        onChange={handleInputChange}
      />
      <Input
        name="plate"
        placeholder="Placa:"
        value={dados.plate}
        onChange={handleInputChange}
      />
      <Input
        name="currentKm"
        type="text"
        placeholder="Quilometragem Atual:"
        value={dados.currentKm}
        onChange={handleInputChange}
      />
      <Input
        name="ano"
        placeholder="Ano:"
        value={dados.ano}
        onChange={handleInputChange}
      />
      <Input
        name="color"
        placeholder="Cor:"
        value={dados.color}
        onChange={handleInputChange}
      />
      <Input
        name="renavam"
        placeholder="Renavam:"
        value={dados.renavam}
        onChange={handleInputChange}
      />

      <Label>Status:</Label>
      <Select name="status" value={dados.status} onChange={handleInputChange}>
        <option value="Ativo">Ativo</option>
        <option value="Inativo">Inativo</option>
        <option value="Em Manutenção">Em Manutenção</option>
      </Select>
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
