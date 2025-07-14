package br.com.rafas.transportes.api.dto;

import br.com.rafas.transportes.api.domain.StatusVeiculo;
import br.com.rafas.transportes.api.domain.Veiculo;

public record DadosDetalhamentoVeiculo(
        Long id,
        String model,
        String plate,
        String ano,
        String color,
        String renavam,
        StatusVeiculo status
) {
    public DadosDetalhamentoVeiculo(Veiculo veiculo) {
        this(
                veiculo.getId(),
                veiculo.getModel(),
                veiculo.getPlate(),
                veiculo.getAno(),
                veiculo.getColor(),
                veiculo.getRenavam(),
                veiculo.getStatus()
        );
    }
}