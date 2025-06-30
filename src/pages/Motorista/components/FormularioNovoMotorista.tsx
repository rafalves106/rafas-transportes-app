import React, { useState, useEffect } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import type { Driver } from "../../../data/driversData";

import {
  FormContainer,
  InputGroup,
  Label,
  Input,
  Select,
  ErrorMessage,
} from "../../../components/ui/Form";

import { RemoveButton } from "../../../components/ui/Button";

interface FormContextType {
  onAdicionar: (dados: Omit<Driver, "id">) => void;
  onEditar: (id: number, dados: Omit<Driver, "id">) => void;
  onExcluir: (id: number) => void;
  motorista?: Driver;
}

export function FormularioNovoMotorista() {
  const { driverId } = useParams();
  const { onAdicionar, onEditar, onExcluir, motorista } =
    useOutletContext<FormContextType>();
  const isEditing = !!driverId;

  const [dados, setDados] = useState<Omit<Driver, "id">>({
    name: "",
    phone: "",
    licenseNumber: "",
    status: "Ativo",
  });
  const [erros, setErros] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isEditing && motorista) {
      setDados(motorista);
    }
  }, [driverId, isEditing, motorista]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setDados((prev) => ({ ...prev, [name]: value as Driver["status"] }));
    if (erros[name]) {
      setErros((prevErros) => ({ ...prevErros, [name]: "" }));
    }
  };

  const validate = () => {
    const novosErros: { [key: string]: string } = {};
    if (!dados.name.trim()) novosErros.name = "Nome é obrigatório.";
    if (!dados.licenseNumber.trim())
      novosErros.licenseNumber = "CNH é obrigatória.";
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
    if (isEditing && driverId) {
      onEditar(parseInt(driverId), dados);
    } else {
      onAdicionar(dados);
    }
  };

  const handleExcluir = () => {
    if (!driverId) return;
    if (
      window.confirm(
        `Tem certeza que deseja excluir o motorista ${dados.name}?`
      )
    ) {
      onExcluir(parseInt(driverId));
    }
  };

  return (
    <FormContainer
      id={
        isEditing ? `form-editar-motorista-${driverId}` : "form-novo-motorista"
      }
      onSubmit={handleSubmit}
    >
      <InputGroup>
        <Label htmlFor="name">Nome Completo</Label>
        <Input
          id="name"
          name="name"
          value={dados.name}
          onChange={handleInputChange}
          hasError={!!erros.name}
        />
        {erros.name && <ErrorMessage>{erros.name}</ErrorMessage>}
      </InputGroup>
      <InputGroup>
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          name="phone"
          value={dados.phone}
          onChange={handleInputChange}
        />
      </InputGroup>
      <InputGroup>
        <Label htmlFor="licenseNumber">Nº da CNH</Label>
        <Input
          id="licenseNumber"
          name="licenseNumber"
          value={dados.licenseNumber}
          onChange={handleInputChange}
          hasError={!!erros.licenseNumber}
        />
        {erros.licenseNumber && (
          <ErrorMessage>{erros.licenseNumber}</ErrorMessage>
        )}
      </InputGroup>
      <InputGroup>
        <Label htmlFor="status">Status</Label>
        <Select
          id="status"
          name="status"
          value={dados.status}
          onChange={handleInputChange}
        >
          <option value="Ativo">Ativo</option>
          <option value="Inativo">Inativo</option>
          <option value="Férias">Férias</option>
        </Select>
      </InputGroup>
      {isEditing && (
        <RemoveButton type="button" onClick={handleExcluir}>
          Excluir Motorista
        </RemoveButton>
      )}
    </FormContainer>
  );
}
