/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.dto;

import jakarta.validation.constraints.FutureOrPresent;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DadosAtualizacaoManutencao(
        // Adicionado Long veiculoId para permitir a troca do veículo em uma manutenção
        Long veiculoId, // NOVO CAMPO: ID do veículo para atualização (pode ser null se não for alterado)

        String title,
        String type,
        @FutureOrPresent
        LocalDate date,
        BigDecimal cost,
        String status,

        // NOVOS CAMPOS:
        // KM da manutenção realizada (para quando o status for "Realizada")
        Integer currentKm,

        // KM para a próxima manutenção agendada (para quando o status for "Realizada" e houver um agendamento)
        Integer proximaKm
) {
}