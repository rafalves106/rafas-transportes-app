package br.com.rafas.transportes.api.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record DadosCadastroFerias(
        @NotNull(message = "O ID do motorista é obrigatório.")
        Long motoristaId,

        @NotNull(message = "A data de início das férias é obrigatória.")
        @FutureOrPresent(message = "A data de início deve ser hoje ou no futuro.")
        LocalDate dataInicio,

        @NotNull(message = "A data de fim das férias é obrigatória.")
        @FutureOrPresent(message = "A data de fim deve ser hoje ou no futuro.")
        LocalDate dataFim
) {
}