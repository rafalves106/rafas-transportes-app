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

  const [manutencoes, setManutencoes] = useState<Maintenance[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState("Agendada");
  const [termoBusca, setTermoBusca] = useState("");

  const [todosOsVeiculos, setTodosOsVeiculos] = useState<Vehicle[]>([]);

  const fetchData = async () => {
    try {
      const [manutencoesData, veiculosData] = await Promise.all([
        manutencaoService.listar(),
        veiculoService.listar(),
      ]);
      setManutencoes(manutencoesData);
      setTodosOsVeiculos(veiculosData);
    } catch (error) {
      console.error("Erro ao buscar dados da página:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      } catch (error) {
        console.error("Falha ao excluir manutenção:", error);
        alert(`Erro ao excluir: ${(error as Error).message}`);
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

      <ListaDeManutencoes
        manutencoes={manutencoesFiltradas}
        veiculos={todosOsVeiculos}
      />

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
