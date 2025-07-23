import { useEffect, useState } from "react";
import styled from "styled-components";
import { orcamentoService, type Orcamento } from "../services/orcamentoService";
import { ListaDeOrcamentos } from "./Orcamentos/ListaDeOrcamentos";
import { useAuth } from "../contexts/AuthContext";
import axios, { AxiosError } from "axios";
import {
  SearchNotFind,
  SearchText,
  SearchTextError,
} from "../components/ui/Layout";

const PageContainer = styled.div`
  padding: 0 2rem;
`;

export function OrcamentosPage() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const { isLoggedIn } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const carregarOrcamentos = async () => {
      if (!isLoggedIn) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await orcamentoService.listar();
        setOrcamentos(data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const axiosError: AxiosError = err;
          if (axiosError.response) {
            if (axiosError.response.status === 403) {
              setError("Acesso negado. Por favor, faça login novamente.");
            } else {
              setError(
                `Erro ao buscar orçamentos: ${axiosError.response.status} - ${axiosError.response.statusText}`
              );
            }
          } else {
            setError(`Erro de rede ou requisição: ${axiosError.message}`);
          }
        } else if (err instanceof Error) {
          setError(`Erro ao buscar orçamentos: ${err.message}`);
        } else {
          setError("Erro desconhecido ao buscar orçamentos.");
        }
        console.error("Erro completo ao buscar orçamentos:", err);
      } finally {
        setLoading(false);
      }
    };

    carregarOrcamentos();
  }, [isLoggedIn]);

  return (
    <PageContainer>
      {loading ? (
        <SearchText>Carregando orçamentos...</SearchText>
      ) : error ? (
        <SearchTextError style={{ color: "red" }}>{error}</SearchTextError>
      ) : orcamentos.length === 0 ? (
        <SearchNotFind>Nenhum orçamento encontrado.</SearchNotFind>
      ) : (
        <ListaDeOrcamentos orcamentos={orcamentos} />
      )}
    </PageContainer>
  );
}
