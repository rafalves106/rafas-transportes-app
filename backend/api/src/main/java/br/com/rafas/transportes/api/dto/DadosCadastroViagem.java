package br.com.rafas.transportes.api.dto;

import br.com.rafas.transportes.api.domain.StatusViagem; // Importa o enum de status
import br.com.rafas.transportes.api.domain.TipoViagem;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record DadosCadastroViagem(
        @NotBlank // Título da reserva é obrigatório
        String title,

        @NotBlank // Nome do cliente é obrigatório
        String clientName,

        String telefone, // Telefone pode ser opcional

        @NotNull @Positive // Valor é obrigatório e deve ser positivo
        BigDecimal valor,

        @NotBlank // Local de início é obrigatório
        String startLocation,

        String endLocation, // Local de fim pode ser vazio

        @NotNull // ID do veículo é obrigatório
        Long veiculoId,

        @NotNull // ID do motorista é obrigatório
        Long motoristaId,

        @NotNull @FutureOrPresent // Data de início é obrigatória e não pode ser no passado
        LocalDate startDate,

        @NotNull // Hora de início é obrigatória
        LocalTime startTime,

        @FutureOrPresent // Data de fim não pode ser no passado (se presente)
        LocalDate endDate,

        LocalTime endTime,

        // Adicione o status da viagem aqui, se o frontend for enviá-lo no cadastro
        // Geralmente, o status inicial é AGENDADA, então o backend pode definir
        // ou receber aqui. Para manter consistente com a entidade, vamos incluí-lo.
        @NotNull
        StatusViagem status,

        @NotNull
        TipoViagem tipoViagem
) {}