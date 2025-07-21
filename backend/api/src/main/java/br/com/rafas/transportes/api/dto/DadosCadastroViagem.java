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

        // --- Estes campos (veiculoId, motoristaId) agora são opcionais aqui ---
        // A validação de obrigatoriedade será condicional no ViagemService,
        // dependendo do tipoViagem (se for ou não ROTA_COLABORADORES).
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

        // --- NOVO CAMPO: Lista de itens para rotas de colaboradores ---
        // Esta lista só será preenchida se tipoViagem for ROTA_COLABORADORES
        // Pode ser @Valid para validar os itens individualmente, e @NotNull se for obrigatória para rotas
        List<DadosItemRotaColaborador> itensRota
) {}