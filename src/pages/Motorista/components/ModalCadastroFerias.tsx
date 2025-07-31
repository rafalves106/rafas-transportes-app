import React, { useState } from "react";
import { ModalGlobal, ModalFooter } from "../../../components/ModalGlobal";
import {
  FormContainer,
  InputGroup,
  Label,
  Input,
  ErrorMessage,
} from "../../../components/ui/Form";
import { Button } from "../../../components/ui/Button";

import {
  feriasService,
  type CadastroFeriasData,
} from "@/services/feriasService";
import axios from "axios";

interface ModalCadastroFeriasProps {
  isOpen: boolean;
  onClose: () => void;
  motoristaId: number;
}

export function ModalCadastroFerias({
  isOpen,
  onClose,
  motoristaId,
}: ModalCadastroFeriasProps) {
  const [formData, setFormData] = useState<CadastroFeriasData>({
    motoristaId: motoristaId,
    dataInicio: "",
    dataFim: "",
  });
  const [erros, setErros] = useState<{ [key: string]: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (erros[name as keyof typeof erros]) {
      setErros((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const novosErros: { [key: string]: string } = {};
    if (!formData.dataInicio) {
      novosErros.dataInicio = "Data de início é obrigatória.";
    }
    if (!formData.dataFim) {
      novosErros.dataFim = "Data de fim é obrigatória.";
    } else if (new Date(formData.dataInicio) > new Date(formData.dataFim)) {
      novosErros.dataFim = "A data de fim deve ser posterior à data de início.";
    }
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

    try {
      await feriasService.cadastrar(formData);
      alert("Período de férias cadastrado com sucesso!");
      onClose();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data.message;
        console.error("Erro da API:", errorMessage);
        alert(errorMessage);
      } else {
        console.error("Erro ao cadastrar férias:", error);
        alert("Ocorreu um erro ao cadastrar as férias.");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <ModalGlobal title="Cadastrar Período de Férias" onClose={onClose}>
      <FormContainer onSubmit={handleSubmit}>
        <InputGroup>
          <Label htmlFor="dataInicio">Data de Início:</Label>
          <Input
            id="dataInicio"
            name="dataInicio"
            type="date"
            value={formData.dataInicio}
            onChange={handleInputChange}
            hasError={!!erros.dataInicio}
          />
          {erros.dataInicio && <ErrorMessage>{erros.dataInicio}</ErrorMessage>}
        </InputGroup>
        <InputGroup>
          <Label htmlFor="dataFim">Data de Fim:</Label>
          <Input
            id="dataFim"
            name="dataFim"
            type="date"
            value={formData.dataFim}
            onChange={handleInputChange}
            hasError={!!erros.dataFim}
          />
          {erros.dataFim && <ErrorMessage>{erros.dataFim}</ErrorMessage>}
        </InputGroup>
        {erros.api && <ErrorMessage>{erros.api}</ErrorMessage>}
        <ModalFooter>
          <Button type="button" onClick={onClose} variant="secondary">
            Cancelar
          </Button>
          <Button type="submit">Salvar</Button>
        </ModalFooter>
      </FormContainer>
    </ModalGlobal>
  );
}
