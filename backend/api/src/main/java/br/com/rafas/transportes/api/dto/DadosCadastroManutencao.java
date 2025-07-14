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
        String type,

        @NotNull
        @FutureOrPresent
        LocalDate date,

        @NotNull
        @Positive
        BigDecimal cost,

        @NotBlank
        String status
) {
}