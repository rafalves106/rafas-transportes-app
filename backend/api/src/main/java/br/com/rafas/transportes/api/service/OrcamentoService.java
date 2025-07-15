/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.service;

import br.com.rafas.transportes.api.domain.Orcamento;
import br.com.rafas.transportes.api.dto.DadosCadastroOrcamento;
import br.com.rafas.transportes.api.dto.DadosDetalhamentoOrcamento;
import br.com.rafas.transportes.api.repository.OrcamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class OrcamentoService {

  @Autowired
  private OrcamentoRepository repository;

  public Orcamento salvar(DadosCadastroOrcamento dados) {
    var orcamento = new Orcamento();

    orcamento.setNomeCliente(dados.nomeCliente());
    orcamento.setTelefone(dados.telefone());
    orcamento.setOrigem(dados.origem());
    orcamento.setDestino(dados.destino());
    orcamento.setDistancia(dados.distancia());
    orcamento.setParadas(dados.paradas());
    orcamento.setValorTotal(dados.valorTotal());

    orcamento.setDataDoOrcamento(LocalDate.now());

    orcamento.setTipoViagemOrcamento(dados.tipoViagemOrcamento());
    orcamento.setDescricaoIdaOrcamento(dados.descricaoIdaOrcamento());
    orcamento.setDescricaoVoltaOrcamento(dados.descricaoVoltaOrcamento());

    repository.save(orcamento);
    return orcamento;
  }

  @Transactional(readOnly = true)
  public List<DadosDetalhamentoOrcamento> listarTodos() {
    return repository.findAll().stream()
            .map(DadosDetalhamentoOrcamento::new)
            .toList();
  }
}