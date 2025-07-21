package br.com.rafas.transportes.api.dto;

import br.com.rafas.transportes.api.domain.StatusViagem;
import br.com.rafas.transportes.api.domain.TipoViagem;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List; // Importar List

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
        LocalDate startDate,
        LocalTime startTime,
        LocalDate endDate,
        LocalTime endTime,
        StatusViagem status, // Status pode ser alterado
        TipoViagem tipoViagem, // Tipo de viagem pode ser alterado

        // --- NOVO CAMPO: Lista de itens para rotas de colaboradores (para atualização) ---
        // Se a lista for enviada, ela substitui (ou mergeia com) a existente na entidade.
        // Se for @Valid, valida os itens individualmente.
        List<DadosItemRotaColaborador> itensRota
) {}