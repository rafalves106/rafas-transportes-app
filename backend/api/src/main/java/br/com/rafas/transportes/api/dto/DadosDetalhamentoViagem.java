package br.com.rafas.transportes.api.dto;

import br.com.rafas.transportes.api.domain.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
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
        LocalDate startDate,
        LocalTime startTime,
        LocalDate endDate,
        LocalTime endTime,
        StatusViagem status,
        TipoViagem tipo,

        List<DadosVeiculoDetalhamento> veiculos,
        List<DadosMotoristaDetalhamento> motoristas
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
                viagem.getStartDate(),
                viagem.getStartTime(),
                viagem.getEndDate(),
                viagem.getEndTime(),
                viagem.getStatus(),
                viagem.getTipoViagem(),

                viagem.getVeiculos() != null ?
                        viagem.getVeiculos().stream()
                                .map(DadosVeiculoDetalhamento::new)
                                .collect(Collectors.toList())
                        : Collections.emptyList(),

                viagem.getMotoristas() != null ?
                        viagem.getMotoristas().stream()
                                .map(DadosMotoristaDetalhamento::new)
                                .collect(Collectors.toList())
                        : Collections.emptyList()
        );
    }
}

record DadosVeiculoDetalhamento(
        Long id,
        String info
) {
    public DadosVeiculoDetalhamento(Veiculo veiculo) {
        this(
                veiculo.getId(),
                veiculo.getModel() + " (" + veiculo.getPlate() + ")"
        );
    }
}

record DadosMotoristaDetalhamento(
        Long id,
        String info
) {
    public DadosMotoristaDetalhamento(Motorista motorista) {
        this(motorista.getId(), motorista.getNome());
    }
}