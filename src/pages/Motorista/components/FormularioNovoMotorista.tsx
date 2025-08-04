import React, { useState, useEffect } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import {
  motoristaService,
  type CadastroDriverData,
  type Driver,
} from "../../../services/motoristaService";

import { Button } from "../../../components/ui/Button";
import {
  FormContainer,
  InputGroup,
  Input,
  Select,
  ErrorMessage,
  Label,
} from "../../../components/ui/Form";

import { ListaDeFerias } from "./ListaDeFerias";
import { InputRow } from "@/components/ui/Layout";
import axios from "axios";
import {
  feriasService,
  type CadastroFeriasData,
} from "@/services/feriasService";

interface FormContextType {
  onSuccess: (motoristaAtualizado?: Driver) => void;
  onExcluir: (id: number) => void;
  motorista?: Driver;
}

type FormState = CadastroDriverData & { status: string };

type FeriasFormState = CadastroFeriasData & { motoristaId: number };

export function FormularioNovoMotorista() {
  const { driverId } = useParams();
  const { onSuccess, onExcluir, motorista } =
    useOutletContext<FormContextType>();
  const isEditing = !!driverId;

  const [dados, setDados] = useState<FormState>({
    nome: "",
    validadeCnh: "",
    telefone: "",
    status: "ATIVO",
  });

  const [originalDados, setOriginalDados] = useState<FormState>({
    nome: "",
    validadeCnh: "",
    telefone: "",
    status: "ATIVO",
  });

  const [erros, setErros] = useState<{ [key: string]: string }>({});

  const [dadosFerias, setDadosFerias] = useState<FeriasFormState>({
    motoristaId: isEditing ? parseInt(driverId!) : 0,
    dataInicio: "",
    dataFim: "",
  });
  const [errosFerias, setErrosFerias] = useState<{ [key: string]: string }>({});

  const [feriasRefreshTrigger, setFeriasRefreshTrigger] = useState(0);

  useEffect(() => {
    if (isEditing && motorista) {
      const dadosIniciais = {
        nome: motorista.nome,
        validadeCnh: motorista.validadeCnh,
        telefone: motorista.telefone,
        status: motorista.status,
      };
      setDados(dadosIniciais);
      setOriginalDados(dadosIniciais);
      setDadosFerias((prev) => ({ ...prev, motoristaId: motorista.id }));
    }
  }, [isEditing, motorista]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setDados((prev) => ({ ...prev, [name]: value }));
    if (erros[name as keyof typeof erros]) {
      setErros((prevErros) => ({ ...prevErros, [name]: "" }));
    }
  };

  const handleFeriasInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDadosFerias((prev) => ({ ...prev, [name]: value }));
    if (errosFerias[name as keyof typeof errosFerias]) {
      setErrosFerias((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validatePhoneNumberFormat = (phoneNumber: string): boolean => {
    const cleanedNumber = phoneNumber.replace(/\D/g, "");

    const phoneRegex = /^\d{10,11}$/;

    return phoneRegex.test(cleanedNumber);
  };

  const validate = () => {
    const novosErros: { [key: string]: string } = {};

    if (!dados.nome.trim()) {
      novosErros.nome = "Nome é obrigatório.";
    }

    if (!dados.validadeCnh.trim()) {
      novosErros.validadeCnh = "Validade da CNH é obrigatória.";
    } else {
      const dataCnh = new Date(dados.validadeCnh);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      if (dataCnh < hoje) {
        novosErros.validadeCnh =
          "A validade da CNH não pode ser uma data passada.";
      }
    }

    if (isEditing && !dados.status.trim()) {
      novosErros.status = "Status é obrigatório.";
    }

    if (!dados.telefone.trim()) {
      novosErros.telefone = "O número de telefone é obrigatório.";
    } else if (!validatePhoneNumberFormat(dados.telefone)) {
      novosErros.telefone =
        "Formato de telefone inválido. Use 10 ou 11 dígitos (incluindo DDD).";
    }

    return novosErros;
  };

  const validateFerias = () => {
    const novosErros: { [key: string]: string } = {};
    if (!dadosFerias.dataInicio) {
      novosErros.dataInicio = "Data de início é obrigatória.";
    }
    if (!dadosFerias.dataFim) {
      novosErros.dataFim = "Data de fim é obrigatória.";
    } else if (
      new Date(dadosFerias.dataInicio) > new Date(dadosFerias.dataFim)
    ) {
      novosErros.dataFim = "A data de fim deve ser posterior à data de início.";
    }
    return novosErros;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("DADOS QUE SERÃO ENVIADOS:", dados);

    const errosDeValidacao = validate();
    if (Object.keys(errosDeValidacao).length > 0) {
      setErros(errosDeValidacao);
      return;
    }
    setErros({});

    try {
      if (isEditing && driverId) {
        await motoristaService.editar(parseInt(driverId), dados);
        onSuccess({ ...dados, id: parseInt(driverId, 10) });
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { status, ...dadosParaCadastro } = dados;
        await motoristaService.adicionar(dadosParaCadastro);
      }

      alert("Operação realizada com sucesso!");
      onSuccess();
    } catch (error) {
      const errorMsg = (error as Error).message;
      console.error("Erro da API:", error);

      if (
        errorMsg.toLowerCase().includes("data") ||
        errorMsg.toLowerCase().includes("validade")
      ) {
        setErros({ validadeCnh: errorMsg });
      } else {
        alert(errorMsg);
      }
    }
  };

  const handleFeriasSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errosDeValidacao = validateFerias();
    if (Object.keys(errosDeValidacao).length > 0) {
      setErrosFerias(errosDeValidacao);
      return;
    }
    setErrosFerias({});

    try {
      await feriasService.cadastrar(dadosFerias);
      alert("Período de férias cadastrado com sucesso!");
      setDadosFerias((prev) => ({ ...prev, dataInicio: "", dataFim: "" }));
      setFeriasRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data.message;
        alert(errorMessage);
      } else {
        alert("Ocorreu um erro ao cadastrar as férias.");
      }
    }
  };

  const handleExcluir = () => {
    if (!driverId) return;
    if (
      window.confirm(
        `Tem certeza que deseja excluir o motorista ${dados.nome}?`
      )
    ) {
      onExcluir(parseInt(driverId));
    }
  };

  const hasChanged = JSON.stringify(dados) !== JSON.stringify(originalDados);

  return (
    <>
      <FormContainer
        id={
          isEditing
            ? `form-editar-motorista-${driverId}`
            : "form-novo-motorista"
        }
        onSubmit={handleSubmit}
      >
        <InputRow>
          <InputGroup>
            <Label htmlFor="nome">Nome Completo: </Label>
            <Input
              id="nome"
              name="nome"
              value={dados.nome}
              placeholder="Nome Completo"
              onChange={handleInputChange}
              hasError={!!erros.nome}
            />
            {erros.nome && <ErrorMessage>{erros.nome}</ErrorMessage>}
          </InputGroup>
          <InputGroup>
            <Label htmlFor="validadeCnh">Validade da CNH</Label>
            <Input
              id="validadeCnh"
              name="validadeCnh"
              type="date"
              placeholder="Validade da CNH"
              value={dados.validadeCnh}
              onChange={handleInputChange}
              hasError={!!erros.validadeCnh}
            />
            {erros.validadeCnh && (
              <ErrorMessage>{erros.validadeCnh}</ErrorMessage>
            )}
          </InputGroup>
          <InputGroup>
            <Label htmlFor="telefone">Telefone: </Label>
            <Input
              id="telefone"
              name="telefone"
              placeholder="Telefone"
              value={dados.telefone}
              onChange={handleInputChange}
              hasError={!!erros.telefone}
            />
            {erros.telefone && <ErrorMessage>{erros.telefone}</ErrorMessage>}
          </InputGroup>
          <InputGroup>
            <Label htmlFor="status">Status do motorista:</Label>
            <Select
              id="status"
              name="status"
              value={dados.status}
              onChange={handleInputChange}
            >
              <option value="ATIVO">Ativo</option>
              <option value="INATIVO">Inativo</option>
              <option value="DE_FERIAS">Férias</option>
            </Select>
          </InputGroup>
        </InputRow>

        <div style={{ display: "flex", flexDirection: "row", gap: "1rem" }}>
          {isEditing && (
            <Button
              variant="danger"
              type="button"
              onClick={handleExcluir}
              style={{ marginTop: "1rem" }}
            >
              Excluir Motorista
            </Button>
          )}
        </div>

        {isEditing && (
          <div style={{ marginTop: "2rem" }} onSubmit={handleFeriasSubmit}>
            <h3>Cadastrar Período de Férias</h3>
            <InputRow>
              <InputGroup>
                <Label htmlFor="dataInicio">Data de Início:</Label>
                <Input
                  id="dataInicio"
                  name="dataInicio"
                  type="date"
                  value={dadosFerias.dataInicio}
                  onChange={handleFeriasInputChange}
                  hasError={!!errosFerias.dataInicio}
                />
                {errosFerias.dataInicio && (
                  <ErrorMessage>{errosFerias.dataInicio}</ErrorMessage>
                )}
              </InputGroup>
              <InputGroup>
                <Label htmlFor="dataFim">Data de Fim:</Label>
                <Input
                  id="dataFim"
                  name="dataFim"
                  type="date"
                  value={dadosFerias.dataFim}
                  onChange={handleFeriasInputChange}
                  hasError={!!errosFerias.dataFim}
                />
                {errosFerias.dataFim && (
                  <ErrorMessage>{errosFerias.dataFim}</ErrorMessage>
                )}
              </InputGroup>
              <Button
                style={{ marginTop: "1.6rem" }}
                type="button"
                onClick={handleFeriasSubmit}
              >
                Salvar Férias
              </Button>
            </InputRow>
          </div>
        )}

        {isEditing && motorista && (
          <ListaDeFerias
            motoristaId={motorista.id}
            refreshTrigger={feriasRefreshTrigger}
          />
        )}

        {isEditing && hasChanged && (
          <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
            <Button variant="secondary" type="button" onClick={() => {}}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              form={`form-editar-motorista-${driverId}`}
            >
              Salvar Alterações
            </Button>
          </div>
        )}
        {!isEditing && (
          <div style={{ marginTop: "1rem" }}>
            <Button variant="primary" type="submit" form="form-novo-motorista">
              Salvar Motorista
            </Button>
          </div>
        )}
      </FormContainer>
    </>
  );
}
