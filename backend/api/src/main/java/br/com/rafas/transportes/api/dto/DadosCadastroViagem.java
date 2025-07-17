package br.com.rafas.transportes.api.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record DadosCadastroViagem(
        @NotBlank
        String title,

        @NotBlank
        String clientName,

        String telefone,

        @NotNull
        BigDecimal valor,

        @NotBlank
        String startLocation,

        String endLocation,

        @NotNull
        Long veiculoId,

        @NotNull
        Long motoristaId,

        @NotNull @FutureOrPresent
        LocalDate startDate,

        @NotNull
        LocalTime startTime,

        @FutureOrPresent
        LocalDate endDate,

        LocalTime endTime
) {
}