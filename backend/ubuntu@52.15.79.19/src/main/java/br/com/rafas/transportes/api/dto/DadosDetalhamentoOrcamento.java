package br.com.rafas.transportes.api.dto;

import br.com.rafas.transportes.api.domain.Orcamento;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DadosDetalhamentoOrcamento(
        Long id,
        String nomeCliente,
        String telefone,
        LocalDate dataDoOrcamento,
        String origem,
        String destino,
        String distancia,
        String paradas,
        BigDecimal valorTotal,
        String tipoViagemOrcamento,
        String descricaoIdaOrcamento,
        String descricaoVoltaOrcamento,
        String textoGerado
) {
    public DadosDetalhamentoOrcamento(Orcamento orcamento) {
        this(
                orcamento.getId(),
                orcamento.getNomeCliente(),
                orcamento.getTelefone(),
                orcamento.getDataDoOrcamento(),
                orcamento.getOrigem(),
                orcamento.getDestino(),
                orcamento.getDistancia(),
                orcamento.getParadas(),
                orcamento.getValorTotal(),
                orcamento.getTipoViagemOrcamento(),
                orcamento.getDescricaoIdaOrcamento(),
                orcamento.getDescricaoVoltaOrcamento(),
                orcamento.getTextoGerado()
        );
    }
}