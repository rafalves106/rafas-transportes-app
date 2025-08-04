/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.service;

import br.com.rafas.transportes.api.domain.Orcamento;
import br.com.rafas.transportes.api.dto.DadosCadastroOrcamento;
import br.com.rafas.transportes.api.dto.DadosDetalhamentoOrcamento;
import br.com.rafas.transportes.api.repository.OrcamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
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

  @Transactional
  public void excluir(Long id) {
    repository.deleteById(id);
  }

  @Scheduled(cron = "0 0 2 * * *")
  @Transactional
  public void excluirOrcamentosAntigos() {
    LocalDate dataLimite = LocalDate.now().minus(Period.ofDays(60));
    List<Orcamento> orcamentosAntigos = repository.findByDataDoOrcamentoBefore(dataLimite);

    if (!orcamentosAntigos.isEmpty()) {
      repository.deleteAll(orcamentosAntigos);
      System.out.println("Excluídos " + orcamentosAntigos.size() + " orçamentos com mais de 60 dias.");
    }
  }
}