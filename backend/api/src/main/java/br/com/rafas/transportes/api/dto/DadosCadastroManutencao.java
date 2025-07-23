/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

public record DadosCadastroManutencao(
        @NotNull
        Long veiculoId,

        @NotBlank
        String title,

        @NotBlank
        String type, // Ex: "Preventiva", "Corretiva"

        @NotNull
        @FutureOrPresent // Data deve ser no presente ou futuro para agendamentos
        LocalDate date,

        @NotNull
        @Positive
        BigDecimal cost,

        @NotBlank
        String status, // Ex: "Agendada", "Realizada"

        // NOVOS CAMPOS:
        // KM da manutenção realizada (se o status for "Realizada")
        // Não é @NotNull aqui, pois pode ser nulo para manutenções "Agendadas"
        Integer currentKm,

        // KM para a próxima manutenção agendada (se a manutenção for "Realizada" e tiver uma próxima)
        // Não é @NotNull aqui, pois é opcional
        Integer proximaKm
) {
}