/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.dto;

import br.com.rafas.transportes.api.domain.Motorista;
import br.com.rafas.transportes.api.domain.StatusMotorista;

import java.time.LocalDate;

public record DadosDetalhamentoMotorista(
        Long id,
        String nome,
        String cpf,
        String cnh,
        LocalDate validadeCnh,
        String telefone,
        StatusMotorista status
) {
    public DadosDetalhamentoMotorista(Motorista motorista) {
        this(
                motorista.getId(),
                motorista.getNome(),
                motorista.getCpf(),
                motorista.getCnh(),
                motorista.getValidadeCnh(),
                motorista.getTelefone(),
                motorista.getStatus()
        );
    }
}