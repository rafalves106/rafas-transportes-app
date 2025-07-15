/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.dto;

import jakarta.validation.constraints.NotBlank;

public record DadosAutenticacao(
        @NotBlank
        String login,
        @NotBlank
        String senha
) {
}