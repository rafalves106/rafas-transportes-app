package br.com.rafas.transportes.api.dto;

import br.com.rafas.transportes.api.domain.StatusViagem;
import br.com.rafas.transportes.api.domain.TipoViagem;
import br.com.rafas.transportes.api.domain.Viagem;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

public record DadosDetalhamentoViagem(
        Long id,
        String title,
        String clientName,
        String telefone,
        BigDecimal valor,
        String startLocation,
        String endLocation,
        Long veiculoId,
        String veiculoInfo, // Informação formatada do veículo para exibição
        Long motoristaId,
        String motoristaNome, // Nome do motorista para exibição
        LocalDate startDate,
        LocalTime startTime,
        LocalDate endDate,
        LocalTime endTime,
        StatusViagem status, // Tipo enum
        TipoViagem tipoViagem, // Tipo enum

        // NOVO CAMPO: Lista de itens para rotas de colaboradores
        List<DadosDetalhamentoItemRotaColaborador> itensRota
) {
    public DadosDetalhamentoViagem(Viagem viagem) {
        this(
                viagem.getId(),
                viagem.getTitle(),
                viagem.getClientName(),
                viagem.getTelefone(),
                viagem.getValor(),
                viagem.getStartLocation(),
                viagem.getEndLocation(),
                // Veículo e motorista principal são nulos se for ROTA_COLABORADORES
                viagem.getVeiculo() != null ? viagem.getVeiculo().getId() : null,
                viagem.getVeiculo() != null ? viagem.getVeiculo().getModel() + " (" + viagem.getVeiculo().getPlate() + ")" : "Veículo não informado",
                viagem.getMotorista() != null ? viagem.getMotorista().getId() : null,
                viagem.getMotorista() != null ? viagem.getMotorista().getNome() : "Motorista não definido",
                viagem.getStartDate(),
                viagem.getStartTime(),
                viagem.getEndDate(),
                viagem.getEndTime(),
                viagem.getStatus(),
                viagem.getTipoViagem(),
                // Popula a lista de itensRota APENAS se o tipo de viagem for ROTA_COLABORADORES
                viagem.getTipoViagem() == TipoViagem.ROTA_COLABORADORES && viagem.getItensRota() != null
                        ? viagem.getItensRota().stream()
                        .map(DadosDetalhamentoItemRotaColaborador::new)
                        .collect(Collectors.toList())
                        : List.of() // Retorna uma lista imutável vazia se não for rota ou lista for nula
        );
    }
}