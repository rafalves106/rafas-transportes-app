/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.dto;

import br.com.rafas.transportes.api.domain.StatusMotorista;
import jakarta.validation.constraints.Future;

import java.time.LocalDate;

public record DadosAtualizacaoMotorista(
        String nome,
        String telefone,
        @Future
        LocalDate validadeCnh,
        StatusMotorista status
) {
}