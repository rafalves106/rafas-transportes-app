package br.com.rafas.transportes.api.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record DadosItemRotaColaborador(
        Long id,
        @NotNull
        Long veiculoId,
        @NotNull
        Long motoristaId,
        @NotNull // A lista de horários é obrigatória
        List<DadosHorarioItemRota> horarios
) {}