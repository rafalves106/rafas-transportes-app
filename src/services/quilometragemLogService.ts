import api from "./api";
import { AxiosError } from "axios";

import { type BackendErrorResponse } from "./veiculoService";

export interface QuilometragemLog {
  id: number;
  veiculoId: number;
  dataHoraRegistro: string;
  quilometragemAnterior: number;
  quilometragemAtual: number;
  origemAlteracao: string;
  idReferenciaOrigem?: number | null;
}

const ROTA = "/quilometragem-log";

export const quilometragemLogService = {
  async buscarLogsPorVeiculo(veiculoId: number): Promise<QuilometragemLog[]> {
    try {
      const response = await api.get<QuilometragemLog[]>(
        `${ROTA}?veiculoId=${veiculoId}`
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar logs de quilometragem:", error);
      throw error as AxiosError<BackendErrorResponse>;
    }
  },

  async limparLogs(veiculoId: number): Promise<void> {
    try {
      await api.delete(`${ROTA}/${veiculoId}`);
    } catch (error) {
      console.error("Erro ao limpar logs de quilometragem:", error);
      throw error;
    }
  },
};

export default quilometragemLogService;
