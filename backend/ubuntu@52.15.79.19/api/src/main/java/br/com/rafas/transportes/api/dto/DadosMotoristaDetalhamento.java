/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.dto;

import br.com.rafas.transportes.api.domain.Motorista;

record DadosMotoristaDetalhamento(
        Long id,
        String info
) {
    public DadosMotoristaDetalhamento(Motorista motorista) {
        this(motorista.getId(), motorista.getNome());
    }
}