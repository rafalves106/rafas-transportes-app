import React, { useState } from "react";
import styled from "styled-components";
import { Button } from "../../components/ui/Button";
import {
  InputGroup,
  Label,
  Input,
  ErrorMessage,
} from "../../components/ui/Form";

import logo from "../../assets/logo.webp";

import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import axios from "axios";

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--cor-secundaria);
`;

const LoginForm = styled.form`
  background-color: var(--cor-de-fundo-cards);
  padding: 2.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  text-align: start;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Logo = styled.img`
  max-width: 12rem;
`;

interface LoginFormDados {
  login: string;
  senha: string;
}

export function LoginPage() {
  const [dados, setDados] = useState<LoginFormDados>({ login: "", senha: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDados((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post("/login", dados);

      login(response.data.token);
      navigate("/");
    } catch (err: unknown) {
      let errorMessage = "Ocorreu um erro. Tente novamente.";
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.status === 403) {
          errorMessage = "Login ou senha inválidos.";
        }
      }
      console.error("Erro no login:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginForm onSubmit={handleSubmit}>
        <LogoContainer>
          <Logo src={logo} alt="Logo Rafas" />
        </LogoContainer>
        <InputGroup>
          <Label htmlFor="login">Login</Label>
          <Input
            id="login"
            name="login"
            type="text"
            value={dados.login}
            onChange={handleInputChange}
            required
            autoComplete="username"
          />
        </InputGroup>
        <InputGroup>
          <Label htmlFor="senha">Senha</Label>
          <Input
            id="senha"
            name="senha"
            type="password"
            value={dados.senha}
            onChange={handleInputChange}
            required
            autoComplete="current-password"
          />
        </InputGroup>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </LoginForm>
    </LoginContainer>
  );
}
