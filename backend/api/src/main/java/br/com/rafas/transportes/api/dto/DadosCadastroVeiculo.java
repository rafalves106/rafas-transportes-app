package br.com.rafas.transportes.api.dto;

import jakarta.validation.constraints.NotBlank;

public record DadosCadastroVeiculo(
        @NotBlank
        String model,
        @NotBlank
        String plate
) {
}