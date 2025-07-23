package br.com.rafas.transportes.api.dto;

import br.com.rafas.transportes.api.domain.StatusVeiculo;
import br.com.rafas.transportes.api.domain.Veiculo;

public record DadosDetalhamentoVeiculo(
        Long id,
        String model,
        String plate,
        StatusVeiculo status,
        Integer currentKm // NOVO CAMPO: Quilometragem atual
) {
    public DadosDetalhamentoVeiculo(Veiculo veiculo) {
        this(
                veiculo.getId(),
                veiculo.getModel(),
                veiculo.getPlate(),
                veiculo.getStatus(),
                veiculo.getCurrentKm() // Atribui o novo campo
        );
    }
}