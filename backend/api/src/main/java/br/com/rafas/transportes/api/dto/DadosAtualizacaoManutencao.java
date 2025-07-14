/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.dto;

import jakarta.validation.constraints.FutureOrPresent;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DadosAtualizacaoManutencao(
        String title,
        String type,
        @FutureOrPresent
        LocalDate date,
        BigDecimal cost,
        String status
) {
}