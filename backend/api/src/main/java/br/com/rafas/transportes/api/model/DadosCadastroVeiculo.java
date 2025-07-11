package br.com.rafas.transportes.api.model;

import jakarta.validation.constraints.NotBlank;

public record DadosCadastroVeiculo(
        @NotBlank
        String model,
        @NotBlank
        String plate,
        String ano,
        String color,
        String renavam
) {
}