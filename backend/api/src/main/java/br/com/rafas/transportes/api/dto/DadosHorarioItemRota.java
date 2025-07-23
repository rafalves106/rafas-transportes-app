package br.com.rafas.transportes.api.dto;

import br.com.rafas.transportes.api.domain.HorarioItemRota;
import com.fasterxml.jackson.annotation.JsonFormat; // Importante: Adicione este import!
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public record DadosHorarioItemRota(
        Long id,
        @NotNull
        @JsonFormat(pattern = "yyyy-MM-dd") // Adicione esta anotação
        LocalDate dataInicio, // NOVO: Data de início
        @NotNull
        @JsonFormat(pattern = "HH:mm") // Adicione esta anotação
        LocalTime inicio,
        @NotNull
        @JsonFormat(pattern = "yyyy-MM-dd") // Adicione esta anotação
        LocalDate dataFim,    // NOVO: Data de fim
        @NotNull
        @JsonFormat(pattern = "HH:mm") // Adicione esta anotação
        LocalTime fim
) {
    public DadosHorarioItemRota(HorarioItemRota horario) {
        this(horario.getId(), horario.getDataInicio(), horario.getInicio(), horario.getDataFim(), horario.getFim());
    }
}