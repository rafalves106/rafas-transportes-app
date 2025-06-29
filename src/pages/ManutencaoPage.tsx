import { useState } from "react";
import { useOutlet, useNavigate, Outlet, useParams } from "react-router-dom";
import { maintenancesData as initialData } from "../data/maintenanceData";
import { FiltroGlobal, type Filtro } from "../components/FiltroGlobal";
import { ModalGlobal } from "../components/ModalGlobal";
import { ListaDeManutencoes } from "./Manutencoes/components/ListaDeManutencoes";
import type { Maintenance } from "../data/maintenanceData";

export function ManutencaoPage() {
  const { maintenanceId } = useParams();
  const outlet = useOutlet();
  const navigate = useNavigate();

  const [manutencoes, setManutencoes] = useState<Maintenance[]>(initialData);
  const [filtroAtivo, setFiltroAtivo] = useState("Agendada");
  const [termoBusca, setTermoBusca] = useState("");

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

  type ManutencaoFormData = Omit<Maintenance, "id"> & { proximaKm?: string };

  const handleAdicionar = (dados: ManutencaoFormData) => {
    const manutencaoPrincipal: Maintenance = {
      id: Date.now(),
      title: dados.title,
      vehicleId: dados.vehicleId,
      type: dados.type,
      date: dados.date,
      cost: dados.cost,
      status: dados.status,
    };

    const novasManutencoesAdicionadas = [manutencaoPrincipal];

    const kmProxima = dados.proximaKm ? parseFloat(dados.proximaKm) : 0;

    if (kmProxima > 0) {
      const manutencaoAgendada: Maintenance = {
        id: Date.now() + 1,
        vehicleId: dados.vehicleId,
        title: `${dados.title} (Próxima em ${kmProxima}km)`,
        type: dados.type,
        date: "",
        cost: 0,
        status: "Agendada",
      };
      novasManutencoesAdicionadas.push(manutencaoAgendada);
    }

    setManutencoes((prev) => [...novasManutencoesAdicionadas, ...prev]);
    navigate("/manutencoes");
  };

  const handleEditar = (id: number, dadosAtualizados: ManutencaoFormData) => {
    setManutencoes((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...dadosAtualizados } : item
      )
    );
    navigate("/manutencoes");
  };

  const handleExcluir = (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta manutenção?")) {
      setManutencoes((prev) => prev.filter((item) => item.id !== id));
      navigate("/manutencoes");
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

      <ListaDeManutencoes manutencoes={manutencoesFiltradas} />

      {outlet && (
        <ModalGlobal
          title={maintenanceId ? "Editar Manutenção" : "Nova Manutenção"}
          onClose={() => navigate("/manutencoes")}
          formId={
            maintenanceId ? `form-editar-mnt-${maintenanceId}` : "form-nova-mnt"
          }
        >
          <Outlet
            context={{
              onAdicionar: handleAdicionar,
              onEditar: handleEditar,
              onExcluir: handleExcluir,
              manutencao: manutencaoParaEditar,
            }}
          />
        </ModalGlobal>
      )}
    </div>
  );
}
