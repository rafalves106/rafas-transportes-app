import { useEffect, useState } from "react";
import { useOutlet, useNavigate, Outlet, useParams } from "react-router-dom";
import { FiltroGlobal, type Filtro } from "../components/FiltroGlobal";
import { ModalGlobal } from "../components/ModalGlobal";
import { ListaDeMotoristas } from "./Motorista/components/ListaDeMotoristas";
import type { Driver } from "../services/motoristaService";
import type { Viagem } from "../services/viagemService";
import { motoristaService } from "../services/motoristaService";
import { viagemService } from "../services/viagemService";
import { Button } from "../components/ui/Button";
import { styled } from "styled-components";

const ModalFooter = styled.footer`
  padding: 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
`;

export function MotoristaPage() {
  const [motoristas, setMotoristas] = useState<Driver[]>([]);
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState("Em Serviço");
  const [termoBusca, setTermoBusca] = useState("");

  const { driverId } = useParams();
  const outlet = useOutlet();
  const navigate = useNavigate();

  const isEditing = !!driverId;

  const filtros: Filtro[] = [
    { id: "Em Serviço", label: "Em Serviço" },
    { id: "Ativo", label: "Ativos" },
    { id: "Inativo", label: "Inativos" },
    { id: "Férias", label: "Férias" },
  ];

  const carregarDados = async () => {
    try {
      const [motoristasData, viagensData] = await Promise.all([
        motoristaService.listar(),
        viagemService.listar(),
      ]);
      setMotoristas(motoristasData);
      setViagens(viagensData);
    } catch (err) {
      console.error("Erro ao carregar dados", err);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const motoristasFiltrados = motoristas
    .filter((motorista) => {
      if (filtroAtivo === "Em Serviço") {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const estaEmServico = viagens.some((trip) => {
          const dataInicio = new Date(trip.startDate + "T00:00");
          const dataFim = new Date(trip.endDate + "T00:00");
          return (
            trip.motoristaNome === motorista.nome &&
            hoje >= dataInicio &&
            hoje <= dataFim
          );
        });

        return estaEmServico;
      }

      switch (filtroAtivo) {
        case "Ativo":
          return motorista.status === "ATIVO";
        case "Inativo":
          return motorista.status === "INATIVO";
        case "Férias":
          return motorista.status === "DE_FERIAS";
        default:
          return false;
      }
    })
    .filter(
      (d) =>
        d.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
        d.cnh.toLowerCase().includes(termoBusca.toLowerCase())
    );

  const handleSuccess = () => {
    carregarDados();
    navigate("/motoristas");
  };

  const handleExcluir = async (id: number) => {
    try {
      await motoristaService.excluir(id);

      setMotoristas((motoristasAtuais) =>
        motoristasAtuais.filter((m) => m.id !== id)
      );

      navigate("/motoristas");
      alert("Motorista excluído com sucesso.");
    } catch (err) {
      alert((err as Error).message);
      console.error("Erro ao excluir motorista", err);
    }
  };

  const motoristaParaEditar = driverId
    ? motoristas.find((d) => d.id === parseInt(driverId))
    : undefined;

  return (
    <div>
      <FiltroGlobal
        termoBusca={termoBusca}
        onTermoBuscaChange={(e) => setTermoBusca(e.target.value)}
        filtros={filtros}
        filtroAtivo={filtroAtivo}
        onFiltroChange={setFiltroAtivo}
      />
      <ListaDeMotoristas motoristas={motoristasFiltrados} viagens={viagens} />
      {outlet && (
        <ModalGlobal
          title={driverId ? "Editar Motorista" : "Novo Motorista"}
          onClose={() => navigate("/motoristas")}
        >
          <Outlet
            context={{
              onSuccess: handleSuccess,
              onExcluir: handleExcluir,
              motorista: motoristaParaEditar,
            }}
          />
          <ModalFooter>
            <Button
              variant="secondary"
              type="button"
              onClick={() => navigate("/motoristas")}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              form={
                isEditing
                  ? `form-editar-motorista-${driverId}`
                  : "form-novo-motorista"
              }
            >
              {isEditing ? "Salvar Alterações" : "Salvar Motorista"}
            </Button>
          </ModalFooter>
        </ModalGlobal>
      )}
    </div>
  );
}
