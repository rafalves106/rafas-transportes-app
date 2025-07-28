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

interface FormContextType {
  onSuccess: (motoristaAtualizado?: Driver) => void;
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
    validadeCnh: "",
    telefone: "",
    status: "ATIVO",
  });
  const [erros, setErros] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isEditing && motorista) {
      setDados({
        nome: motorista.nome,
        validadeCnh: motorista.validadeCnh,
        telefone: motorista.telefone,
        status: motorista.status,
      });
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

  const validate = () => {
    const novosErros: { [key: string]: string } = {};
    if (!dados.nome.trim()) novosErros.nome = "Nome é obrigatório.";
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
        <Input
          name="nome"
          value={dados.nome}
          placeholder="Nome Completo"
          onChange={handleInputChange}
          hasError={!!erros.nome}
        />
        {erros.nome && <ErrorMessage>{erros.nome}</ErrorMessage>}
      </InputGroup>
      <InputGroup>
        <Label htmlFor="validadeCnh">Validade</Label>
        <Input
          name="validadeCnh"
          type="date"
          placeholder="Validade da CNH"
          value={dados.validadeCnh}
          onChange={handleInputChange}
          hasError={!!erros.validadeCnh}
        />
        {erros.validadeCnh && <ErrorMessage>{erros.validadeCnh}</ErrorMessage>}
      </InputGroup>
      <InputGroup>
        <Input
          name="telefone"
          placeholder="Telefone"
          value={dados.telefone}
          onChange={handleInputChange}
        />
      </InputGroup>

      {isEditing && (
        <InputGroup>
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
          style={{ marginTop: "1rem", marginBottom: "1.5rem" }}
        >
          Excluir Motorista
        </Button>
      )}
    </FormContainer>
  );
}
