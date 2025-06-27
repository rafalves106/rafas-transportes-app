import { useState, useEffect } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import styled from "styled-components";
import type { Vehicle } from "../../../data/vehiclesData";

const FormContainer = styled.form``;

const Label = styled.label`
  font-weight: 500;
  font-size: 0.9rem;
  color: #495057;
`;
const Input = styled.input<{ hasError?: boolean }>`
  width: 100%;
  font-size: 0.9rem;
  padding: 0.75rem;
  border: 1px solid ${(props) => (props.hasError ? "#d9534f" : "#ced4da")};
  background-color: #f8f9fa;
  border-radius: 6px;
`;
const Select = styled.select<{ hasError?: boolean }>`
  width: 100%;
  font-size: 0.9rem;
  padding: 0.75rem;
  border: 1px solid ${(props) => (props.hasError ? "#d9534f" : "#ced4da")};
  border-radius: 6px;
  background-color: #f8f9fa;
`;

const RemoveButton = styled.button`
  margin-top: 1rem;
  padding: 0.75rem;
  width: 100%;
  background-color: transparent;
  color: var(--cor-remover);
  border: 1px solid var(--cor-remover);
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: var(--cor-remover);
    color: white;
  }
`;

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
