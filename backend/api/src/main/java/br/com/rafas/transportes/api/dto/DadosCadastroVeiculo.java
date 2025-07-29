package br.com.rafas.transportes.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DadosCadastroVeiculo(
        @NotBlank
        String model,
        @NotBlank
        String plate,
        @NotBlank @NotNull
        String status,
        @NotNull
        Integer currentKM
) {
}