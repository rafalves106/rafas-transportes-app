package br.com.rafas.transportes.api.dto;

import br.com.rafas.transportes.api.domain.StatusViagem;
import br.com.rafas.transportes.api.domain.TipoViagem;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record DadosAtualizacaoViagem(
        String title,
        String clientName,
        String telefone,
        @Positive // Se o valor for enviado, deve ser positivo
        BigDecimal valor,
        String startLocation,
        String endLocation,
        Long veiculoId, // Pode ser alterado
        Long motoristaId, // Pode ser alterado
        @FutureOrPresent
        LocalDate startDate,
        LocalTime startTime,
        @FutureOrPresent
        LocalDate endDate,
        LocalTime endTime,
        StatusViagem status, // Status pode ser alterado
        TipoViagem tipoViagem // Tipo de viagem pode ser alterado
) {}