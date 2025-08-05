package br.com.rafas.transportes.api.dto;
import br.com.rafas.transportes.api.domain.StatusViagem;
import br.com.rafas.transportes.api.domain.TipoViagem;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
public record DadosCadastroViagem(
        @NotBlank
        String title,
        @NotBlank
        String clientName,
        String telefone,
        @NotNull @Positive
        BigDecimal valor,
        @NotBlank
        String startLocation,
        String endLocation,
        @NotNull
        Long veiculoId,
        @NotNull
        Long motoristaId,
        @NotNull
        LocalDate startDate,
        @NotNull
        LocalTime startTime,
        LocalDate endDate,
        LocalTime endTime,
        @NotNull
        StatusViagem status,
        @NotNull
        TipoViagem tipoViagem
) {}