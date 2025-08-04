import React, { useEffect, useState } from "react";
import quilometragemLogService, {
  type QuilometragemLog,
} from "@/services/quilometragemLogService";
import { Button } from "@/components/ui/Button";
import { ModalGlobal } from "@/components/ModalGlobal";
import {
  SearchText,
  SearchTextError,
  SearchNotFind,
} from "@/components/ui/Layout";
import { format } from "date-fns";
import axios from "axios";

interface HistoricoQuilometragemModalProps {
  veiculoId: number;
  onClose: () => void;
}

export const HistoricoQuilometragemModal: React.FC<
  HistoricoQuilometragemModalProps
> = ({ veiculoId, onClose }) => {
  const [logs, setLogs] = useState<QuilometragemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleLimparLog = async () => {
    if (
      window.confirm(
        "Tem certeza que deseja limpar todo o histórico de quilometragem deste veículo? Esta ação não pode ser desfeita."
      )
    ) {
      setDeleting(true);
      setDeleteError(null);
      try {
        await quilometragemLogService.limparLogs(veiculoId);
        alert("Histórico de quilometragem limpo com sucesso!");
        await fetchLogs();
        setDeleting(false);
      } catch (err) {
        setDeleting(false);
        if (axios.isAxiosError(err) && err.response) {
          const errorMessage =
            (err.response.data as { message?: string })?.message ||
            "Erro desconhecido";
          setDeleteError(errorMessage);
          alert(`Erro ao limpar log: ${errorMessage}`);
        } else {
          setDeleteError("Ocorreu um erro inesperado.");
          alert("Erro ao tentar limpar o histórico de quilometragem.");
        }
      }
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedLogs = await quilometragemLogService.buscarLogsPorVeiculo(
        veiculoId
      );
      setLogs(fetchedLogs);
    } catch (err) {
      console.error("Erro ao buscar histórico de quilometragem:", err);
      setError(
        "Não foi possível carregar o histórico de quilometragem. Tente novamente mais tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [veiculoId]);

  return (
    <ModalGlobal
      title={`Histórico de Quilometragem - Veículo ID: ${veiculoId}`}
      onClose={onClose}
    >
      {loading || deleting ? (
        <SearchText>
          {deleting ? "Limpando histórico..." : "Carregando histórico..."}
        </SearchText>
      ) : error || deleteError ? (
        <SearchTextError style={{ color: "red" }}>
          {error || deleteError}
        </SearchTextError>
      ) : logs.length === 0 ? (
        <SearchNotFind>
          Nenhum registro de quilometragem encontrado para este veículo.
        </SearchNotFind>
      ) : (
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {" "}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "1rem",
              marginBottom: "1rem",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                <th style={{ padding: "0.5rem", textAlign: "left" }}>
                  Data/Hora
                </th>
                <th style={{ padding: "0.5rem", textAlign: "left" }}>
                  KM Anterior
                </th>
                <th style={{ padding: "0.5rem", textAlign: "left" }}>
                  KM Atual
                </th>
                <th style={{ padding: "0.5rem", textAlign: "left" }}>Origem</th>
                <th style={{ padding: "0.5rem", textAlign: "left" }}>
                  Ref. Origem
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  style={{ borderBottom: "1px solid var(--color-border)" }}
                >
                  <td style={{ padding: "0.5rem" }}>
                    {log.dataHoraRegistro
                      ? format(
                          new Date(log.dataHoraRegistro),
                          "dd/MM/yyyy HH:mm"
                        )
                      : "-"}
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    {log.quilometragemAnterior}
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    {log.quilometragemAtual}
                  </td>
                  <td style={{ padding: "0.5rem" }}>{log.origemAlteracao}</td>
                  <td style={{ padding: "0.5rem" }}>
                    {log.idReferenciaOrigem || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "0.5rem",
        }}
      >
        <Button variant="danger" onClick={handleLimparLog} disabled={deleting}>
          Limpar Log
        </Button>
        <Button
          style={{ marginBottom: "1rem" }}
          variant="secondary"
          onClick={onClose}
        >
          Fechar
        </Button>
      </div>
    </ModalGlobal>
  );
};
