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

  // A tipagem do estado agora permite que currentKm seja string para o input
  // e será convertido para number antes de ser enviado para a API/estado interno Vehicle
  const [dados, setDados] = useState<
    Omit<Vehicle, "id" | "currentKm"> & { currentKm: string | number }
  >({
    model: "",
    plate: "",
    status: "Ativo",
    ano: "",
    color: "",
    renavam: "",
    currentKm: "", // Inicializa como string vazia
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // NOVO: Lógica de conversão para currentKm
    if (name === "currentKm") {
      // Armazena como string no estado, mas garante que seja um número válido ou vazio
      setDados((prev) => ({
        ...prev,
        [name]: value, // Armazena a string do input
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
        currentKm: String(veiculo.currentKm || 0), // Converte para string para o input type="text"
      });
    }
  }, [vehicleId, isEditing, veiculo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Converte currentKm para number antes de passar para onAdicionar/onEditar
    const dadosParaEnvio = {
      ...dados,
      currentKm:
        typeof dados.currentKm === "string" && dados.currentKm !== ""
          ? parseInt(dados.currentKm, 10) || 0
          : typeof dados.currentKm === "number"
          ? dados.currentKm
          : 0, // Se já for number, usa, senão 0
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
      {/* NOVO CAMPO: Quilometragem Atual */}
      <Input
        name="currentKm"
        type="text" // ALTERADO: agora é type="text"
        placeholder="Quilometragem Atual:"
        value={dados.currentKm}
        onChange={handleInputChange}
      />
      {/* Certifique-se de ter inputs para 'ano', 'color', 'renavam' se eles são parte da interface Vehicle */}
      {/* Exemplo: */}
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
        <Button variant="danger" type="button" onClick={handleExcluir}>
          Excluir Veículo
        </Button>
      )}
    </FormContainer>
  );
}
