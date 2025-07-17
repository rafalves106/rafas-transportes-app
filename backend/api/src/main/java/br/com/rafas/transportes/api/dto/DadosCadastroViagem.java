package br.com.rafas.transportes.api.dto;

import br.com.rafas.transportes.api.domain.TipoViagem;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

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

        @NotNull @FutureOrPresent
        LocalDate startDate,

        @NotNull
        LocalTime startTime,

        @FutureOrPresent
        LocalDate endDate,

        LocalTime endTime,

        TipoViagem tipo,

        @NotEmpty
        List<Long> veiculoIds,

        @NotEmpty
        List<Long> motoristaIds
) {
}