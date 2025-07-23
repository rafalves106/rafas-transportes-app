package br.com.rafas.transportes.api.dto;

import br.com.rafas.transportes.api.domain.StatusViagem;
import br.com.rafas.transportes.api.domain.TipoViagem;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List; // Importar List

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

        // Estes campos (veiculoId, motoristaId, datas/horas) são opcionais no DTO
        // Sua obrigatoriedade será validada condicionalmente no ViagemService
        Long veiculoId,
        Long motoristaId,

        LocalDate startDate,
        LocalTime startTime,

        LocalDate endDate,
        LocalTime endTime,

        @NotNull
        StatusViagem status,

        @NotNull
        TipoViagem tipoViagem,

        // NOVO CAMPO: Lista de itens para rotas de colaboradores
        @NotNull // A lista de itens da rota é obrigatória se o tipoViagem for ROTA_COLABORADORES
        List<DadosItemRotaColaborador> itensRota
) {}