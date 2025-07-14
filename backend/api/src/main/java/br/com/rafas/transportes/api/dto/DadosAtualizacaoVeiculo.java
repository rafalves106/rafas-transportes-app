package br.com.rafas.transportes.api.dto;

import br.com.rafas.transportes.api.domain.StatusVeiculo;

public record DadosAtualizacaoVeiculo(
        String model,
        String plate,
        String ano,
        String color,
        String renavam,
        StatusVeiculo status
) {
}