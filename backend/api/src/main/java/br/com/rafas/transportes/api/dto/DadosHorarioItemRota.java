package br.com.rafas.transportes.api.dto;

import br.com.rafas.transportes.api.domain.HorarioItemRota;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public record DadosHorarioItemRota(
        Long id,
        @NotNull
        LocalDate dataInicio, // NOVO: Data de início
        @NotNull
        LocalTime inicio,
        @NotNull
        LocalDate dataFim,    // NOVO: Data de fim
        @NotNull
        LocalTime fim
) {
    public DadosHorarioItemRota(HorarioItemRota horario) {
        this(horario.getId(), horario.getDataInicio(), horario.getInicio(), horario.getDataFim(), horario.getFim());
    }
}