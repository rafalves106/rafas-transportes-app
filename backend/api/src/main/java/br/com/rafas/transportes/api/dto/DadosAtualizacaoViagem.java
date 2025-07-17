package br.com.rafas.transportes.api.dto;

import br.com.rafas.transportes.api.domain.StatusViagem;
import br.com.rafas.transportes.api.domain.TipoViagem;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record DadosAtualizacaoViagem(
        String title,
        String clientName,
        String telefone,
        BigDecimal valor,
        String startLocation,
        String endLocation,
        LocalDate startDate,
        LocalTime startTime,
        LocalDate endDate,
        LocalTime endTime,
        StatusViagem status,
        TipoViagem tipo,
        List<Long> veiculoIds,
        List<Long> motoristaIds
) {
}