package br.com.rafas.transportes.api.model;

public record DadosAtualizacaoVeiculo(
        String model,
        String plate,
        String ano,
        String color,
        String renavam,
        StatusVeiculo status
) {
}