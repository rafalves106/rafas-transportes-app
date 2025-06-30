import { useState, useEffect } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import type { Vehicle } from "../../../data/vehiclesData";

import {
  FormContainer,
  Label,
  Input,
  Select,
} from "../../../components/ui/Form";

import { RemoveButton } from "../../../components/ui/Button";

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

  const [dados, setDados] = useState<Omit<Vehicle, "id">>({
    model: "",
    plate: "",
    status: "Ativo",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setDados((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (isEditing && veiculo) {
      setDados({
        model: veiculo.model,
        plate: veiculo.plate,
        status: veiculo.status,
      });
    }
  }, [vehicleId, isEditing, veiculo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      onEditar(parseInt(vehicleId), dados);
    } else {
      onAdicionar(dados);
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
      <Label>Modelo:</Label>
      <Input name="model" value={dados.model} onChange={handleInputChange} />
      <Label>Placa:</Label>
      <Input name="plate" value={dados.plate} onChange={handleInputChange} />
      <Label>Status:</Label>
      <Select name="status" value={dados.status} onChange={handleInputChange}>
        <option value="Ativo">Ativo</option>
        <option value="Inativo">Inativo</option>
        <option value="Em Manutenção">Em Manutenção</option>
      </Select>

      {isEditing && (
        <RemoveButton type="button" onClick={handleExcluir}>
          Excluir Veículo
        </RemoveButton>
      )}
    </FormContainer>
  );
}
