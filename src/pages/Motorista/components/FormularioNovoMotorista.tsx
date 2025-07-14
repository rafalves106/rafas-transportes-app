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
  Label,
  Input,
  Select,
  ErrorMessage,
} from "../../../components/ui/Form";

interface FormContextType {
  onSuccess: () => void;
  onExcluir: (id: number) => void;
  motorista?: Driver;
}
type FormState = CadastroDriverData & { status: string };

export function FormularioNovoMotorista() {
  const { driverId } = useParams();
  const { onSuccess, onExcluir, motorista } =
    useOutletContext<FormContextType>();
  const isEditing = !!driverId;

  const [dados, setDados] = useState<FormState>({
    nome: "",
    cpf: "",
    cnh: "",
    validadeCnh: "",
    telefone: "",
    status: "ATIVO",
  });
  const [erros, setErros] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isEditing && motorista) {
      setDados({
        nome: motorista.nome,
        cpf: motorista.cpf,
        cnh: motorista.cnh,
        validadeCnh: motorista.validadeCnh,
        telefone: motorista.telefone,
        status: motorista.status,
      });
    }
  }, [driverId, isEditing, motorista]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setDados((prev) => ({ ...prev, [name]: value }));
    if (erros[name as keyof typeof erros]) {
      setErros((prevErros) => ({ ...prevErros, [name]: "" }));
    }
  };

  const validate = () => {
    const novosErros: { [key: string]: string } = {};
    if (!dados.nome.trim()) novosErros.nome = "Nome é obrigatório.";
    if (!dados.cnh.trim()) novosErros.cnh = "CNH é obrigatória.";
    if (!dados.cpf.trim()) novosErros.cpf = "CPF é obrigatório.";
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
      if (isEditing && driverId) {
        await motoristaService.editar(parseInt(driverId), dados);
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

      if (errorMsg.toLowerCase().includes("cnh")) {
        setErros({ cnh: errorMsg });
      } else if (errorMsg.toLowerCase().includes("cpf")) {
        setErros({ cpf: errorMsg });
      } else if (
        errorMsg.toLowerCase().includes("data") ||
        errorMsg.toLowerCase().includes("validade")
      ) {
        setErros({ validadeCnh: errorMsg });
      } else {
        alert(errorMsg);
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

  return (
    <FormContainer
      id={
        isEditing ? `form-editar-motorista-${driverId}` : "form-novo-motorista"
      }
      onSubmit={handleSubmit}
    >
      <InputGroup>
        <Label htmlFor="nome">Nome Completo</Label>
        <Input
          name="nome"
          value={dados.nome}
          onChange={handleInputChange}
          hasError={!!erros.nome}
        />
        {erros.nome && <ErrorMessage>{erros.nome}</ErrorMessage>}
      </InputGroup>
      <InputGroup>
        <Label htmlFor="cpf">CPF</Label>
        <Input
          name="cpf"
          value={dados.cpf}
          onChange={handleInputChange}
          hasError={!!erros.cpf}
        />
        {erros.cpf && <ErrorMessage>{erros.cpf}</ErrorMessage>}
      </InputGroup>
      <InputGroup>
        <Label htmlFor="cnh">Nº da CNH</Label>
        <Input
          name="cnh"
          value={dados.cnh}
          onChange={handleInputChange}
          hasError={!!erros.cnh}
        />
        {erros.cnh && <ErrorMessage>{erros.cnh}</ErrorMessage>}
      </InputGroup>
      <InputGroup>
        <Label htmlFor="validadeCnh">Validade da CNH</Label>
        <Input
          name="validadeCnh"
          type="date"
          value={dados.validadeCnh}
          onChange={handleInputChange}
          hasError={!!erros.validadeCnh}
        />
        {erros.validadeCnh && <ErrorMessage>{erros.validadeCnh}</ErrorMessage>}
      </InputGroup>
      <InputGroup>
        <Label htmlFor="telefone">Telefone</Label>
        <Input
          name="telefone"
          value={dados.telefone}
          onChange={handleInputChange}
        />
      </InputGroup>

      {isEditing && (
        <InputGroup>
          <Label htmlFor="status">Status</Label>
          <Select
            name="status"
            value={dados.status}
            onChange={handleInputChange}
          >
            <option value="ATIVO">Ativo</option>
            <option value="INATIVO">Inativo</option>
            <option value="DE_FERIAS">Férias</option>
          </Select>
        </InputGroup>
      )}

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
    </FormContainer>
  );
}
