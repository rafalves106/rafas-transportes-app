/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.service;

import br.com.rafas.transportes.api.dto.DadosAtualizacaoManutencao;
import br.com.rafas.transportes.api.dto.DadosCadastroManutencao;
import br.com.rafas.transportes.api.dto.DadosDetalhamentoManutencao;
import br.com.rafas.transportes.api.domain.Manutencao;
import br.com.rafas.transportes.api.repository.ManutencaoRepository;
import br.com.rafas.transportes.api.repository.VeiculoRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ManutencaoService {

  @Autowired
  private ManutencaoRepository manutencaoRepository;

  @Autowired
  private VeiculoRepository veiculoRepository;

  public DadosDetalhamentoManutencao cadastrar(DadosCadastroManutencao dados) {
    var veiculo = veiculoRepository.findById(dados.veiculoId())
            .orElseThrow(() -> new EntityNotFoundException("Veículo não encontrado com o ID: " + dados.veiculoId()));

    var manutencao = new Manutencao(
            null,
            dados.title(),
            dados.type(),
            dados.date(),
            dados.cost(),
            dados.status(),
            veiculo
    );

    manutencaoRepository.save(manutencao);

    return new DadosDetalhamentoManutencao(manutencao);
  }

  public List<DadosDetalhamentoManutencao> listarTodas() {
    return manutencaoRepository.findAll().stream()
            .map(DadosDetalhamentoManutencao::new)
            .toList();
  }

  public DadosDetalhamentoManutencao atualizar(Long id, DadosAtualizacaoManutencao dados) {
    var manutencao = manutencaoRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Manutenção não encontrada com o ID: " + id));

    if (dados.status() != null && dados.status().equalsIgnoreCase("Realizada")) {
      LocalDate dataParaValidar = (dados.date() != null) ? dados.date() : manutencao.getDate();

      if (dataParaValidar.isAfter(LocalDate.now())) {
        throw new ValidationException("Não é possível marcar uma manutenção como 'Realizada' com uma data futura.");
      }
    }

    manutencao.atualizarInformacoes(dados);

    return new DadosDetalhamentoManutencao(manutencao);
  }

  public void excluir(Long id) {
    if (!manutencaoRepository.existsById(id)) {
      throw new EntityNotFoundException("Manutenção não encontrada com o ID: " + id);
    }
    manutencaoRepository.deleteById(id);
  }
}