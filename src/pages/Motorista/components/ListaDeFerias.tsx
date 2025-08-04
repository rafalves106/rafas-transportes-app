import { useState, useEffect } from "react";
import styled from "styled-components";
import { feriasService, type Ferias } from "../../../services/feriasService";
import { SearchText } from "../../../components/ui/Layout";
import { Button } from "@/components/ui/Button";

const FeriasListContainer = styled.div`
  padding-top: 1.5rem;
`;

const FeriasTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1rem;
`;

const FeriasItem = styled.div`
  background: var(--color-cardBackground);
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const FeriasDates = styled.span`
  font-weight: 500;
`;

interface ListaDeFeriasProps {
  motoristaId: number;
  refreshTrigger: number;
}

const formatarData = (dataString: string): string => {
  const [ano, mes, dia] = dataString.split("-");
  return `${dia}/${mes}/${ano}`;
};

export function ListaDeFerias({
  motoristaId,
  refreshTrigger,
}: ListaDeFeriasProps) {
  const [feriasList, setFeriasList] = useState<Ferias[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFerias = async () => {
      try {
        const data = await feriasService.listarPorMotoristaId(motoristaId);
        setFeriasList(data);
      } catch (err) {
        setError("Não foi possível carregar as férias.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFerias();
  }, [motoristaId, refreshTrigger]);

  const handleExcluirFerias = async (feriasId: number, dataInicio: string) => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir as férias a partir de ${formatarData(
          dataInicio
        )}`
      )
    ) {
      try {
        await feriasService.excluir(feriasId);
        setFeriasList(feriasList.filter((f) => f.id !== feriasId));
        alert("Férias excluídas com sucesso!");
      } catch (err) {
        alert("Erro ao excluir as férias.");
        console.error("Erro ao excluir férias.", err);
      }
    }
  };

  if (loading) return <SearchText>Carregando períodos de férias...</SearchText>;
  if (error) return <SearchText>{error}</SearchText>;
  if (feriasList.length === 0)
    return (
      <FeriasListContainer>
        <SearchText>Nenhum período de férias cadastrado.</SearchText>
      </FeriasListContainer>
    );

  return (
    <FeriasListContainer>
      <FeriasTitle>Períodos de Férias</FeriasTitle>
      {feriasList.map((ferias) => (
        <FeriasItem key={ferias.id}>
          <FeriasDates>
            {formatarData(ferias.dataInicio)} - {formatarData(ferias.dataFim)}
          </FeriasDates>
          <Button
            variant="danger"
            onClick={() => handleExcluirFerias(ferias.id, ferias.dataInicio)}
          >
            Excluir Férias
          </Button>
        </FeriasItem>
      ))}
    </FeriasListContainer>
  );
}
