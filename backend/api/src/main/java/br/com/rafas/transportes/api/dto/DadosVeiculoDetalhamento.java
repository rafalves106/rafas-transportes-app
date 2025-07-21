/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.dto;

import br.com.rafas.transportes.api.domain.Veiculo;

record DadosVeiculoDetalhamento(
        Long id,
        String info
) {
    public DadosVeiculoDetalhamento(Veiculo veiculo) {
        this(
                veiculo.getId(),
                veiculo.getModel() + " (" + veiculo.getPlate() + ")"
        );
    }
}