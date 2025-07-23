package br.com.rafas.transportes.api.dto;
import br.com.rafas.transportes.api.domain.StatusViagem;
import br.com.rafas.transportes.api.domain.TipoViagem;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
public record DadosAtualizacaoViagem(
        String title,
        String clientName,
        String telefone,
        @Positive
        BigDecimal valor,
        String startLocation,
        String endLocation,
        Long veiculoId,
        Long motoristaId,
        LocalDate startDate,
        LocalTime startTime,
        LocalDate endDate,
        LocalTime endTime,
        StatusViagem status,
        TipoViagem tipoViagem
) {}