import { useEffect, useState } from "react";
import { useOutlet, useNavigate, Outlet, useParams } from "react-router-dom";
import { FiltroGlobal, type Filtro } from "../components/FiltroGlobal";
import { ModalGlobal } from "../components/ModalGlobal";
import { ListaDeManutencoes } from "./Manutencoes/components/ListaDeManutencoes";
import { Button } from "../components/ui/Button";
import { styled } from "styled-components";

import {
  manutencaoService,
  type Maintenance,
} from "../services/manutencaoService";
import { veiculoService, type Vehicle } from "../services/veiculoService";
import { useAuth } from "../contexts/AuthContext";
import axios, { AxiosError } from "axios";

const ModalFooter = styled.footer`
  padding: 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
`;

export function ManutencaoPage() {
  const { maintenanceId } = useParams();
  const outlet = useOutlet();
  const navigate = useNavigate();

  const isEditing = !!maintenanceId;
  const { isLoggedIn } = useAuth();
  const [manutencoes, setManutencoes] = useState<Maintenance[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState("Agendada");
  const [termoBusca, setTermoBusca] = useState("");

  const [todosOsVeiculos, setTodosOsVeiculos] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [manutencoesData, veiculosData] = await Promise.all([
        manutencaoService.listar(),
        veiculoService.listar(),
      ]);
      setManutencoes(manutencoesData);
      setTodosOsVeiculos(veiculosData);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const axiosError: AxiosError = err;
        if (axiosError.response) {
          if (axiosError.response.status === 403) {
            setError("Acesso negado. Por favor, faça login novamente.");
          } else {
            setError(
              `Erro ao buscar manutenções: ${axiosError.response.status} - ${axiosError.response.statusText}`
            );
          }
        } else {
          setError(`Erro de rede ou requisição: ${axiosError.message}`);
        }
      } else if (err instanceof Error) {
        setError(`Erro ao buscar manutenções: ${err.message}`);
      } else {
        setError("Erro desconhecido ao buscar manutenções.");
      }
      console.error("Erro completo ao buscar manutenções:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isLoggedIn]);

  const filtros: Filtro[] = [
    { id: "Agendada", label: "Agendadas" },
    { id: "Realizada", label: "Realizadas" },
  ];

  const manutencoesFiltradas = manutencoes
    .filter((m) => m.status === filtroAtivo)
    .filter((m) => m.title.toLowerCase().includes(termoBusca.toLowerCase()));

  const manutencaoParaEditar = maintenanceId
    ? manutencoes.find((m) => m.id === parseInt(maintenanceId))
    : undefined;

  const handleSuccess = () => {
    fetchData();
    navigate("/manutencoes");
  };

  const handleExcluir = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta manutenção?")) {
      try {
        await manutencaoService.excluir(id);

        setManutencoes((manutencoesAtuais) =>
          manutencoesAtuais.filter((m) => m.id !== id)
        );
        navigate("/manutencoes");
        alert("Manutenção excluída com sucesso.");
      } catch (err) {
        console.error("Falha ao excluir manutenção:", err);
        if (axios.isAxiosError(err) && err.response) {
          alert(
            `Erro ao excluir: ${err.response.status} - ${err.response.statusText}`
          );
        } else if (err instanceof Error) {
          alert(`Erro ao excluir: ${err.message}`);
        } else {
          alert("Erro desconhecido ao excluir.");
        }
      }
    }
  };

  return (
    <div>
      <FiltroGlobal
        termoBusca={termoBusca}
        onTermoBuscaChange={(e) => setTermoBusca(e.target.value)}
        filtros={filtros}
        filtroAtivo={filtroAtivo}
        onFiltroChange={setFiltroAtivo}
      />

      {loading ? (
        <div>Carregando manutenções...</div>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : manutencoesFiltradas.length === 0 ? (
        <p>Nenhuma manutenção encontrada para este filtro ou busca.</p>
      ) : (
        <ListaDeManutencoes
          manutencoes={manutencoesFiltradas}
          veiculos={todosOsVeiculos}
        />
      )}

      {outlet && (
        <ModalGlobal
          title={maintenanceId ? "Editar Manutenção" : "Nova Manutenção"}
          onClose={() => navigate("/manutencoes")}
        >
          <Outlet
            context={{
              onSuccess: handleSuccess,
              onExcluir: handleExcluir,
              manutencao: manutencaoParaEditar,
              todosOsVeiculos: todosOsVeiculos,
            }}
          />

          <ModalFooter>
            <Button
              variant="secondary"
              type="button"
              onClick={() => navigate("/manutencoes")}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              form={
                isEditing ? `form-editar-mnt-${maintenanceId}` : "form-nova-mnt"
              }
            >
              {isEditing ? "Salvar Alterações" : "Salvar Manutenção"}
            </Button>
          </ModalFooter>
        </ModalGlobal>
      )}
    </div>
  );
}
