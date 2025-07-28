package br.com.rafas.transportes.api.service;
import br.com.rafas.transportes.api.dto.DadosAtualizacaoManutencao;
import br.com.rafas.transportes.api.dto.DadosCadastroManutencao;
import br.com.rafas.transportes.api.dto.DadosDetalhamentoManutencao;
import br.com.rafas.transportes.api.domain.Manutencao;
import br.com.rafas.transportes.api.domain.Veiculo;
import br.com.rafas.transportes.api.repository.ManutencaoRepository;
import br.com.rafas.transportes.api.repository.VeiculoRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
@Service
public class ManutencaoService {
  @Autowired
  private ManutencaoRepository manutencaoRepository;
  @Autowired
  private VeiculoRepository veiculoRepository;
  @Transactional(readOnly = true)
  public List<DadosDetalhamentoManutencao> listarTodas() {
    return manutencaoRepository.findAll().stream()
            .map(DadosDetalhamentoManutencao::new)
            .toList();
  }
  @Transactional
  public DadosDetalhamentoManutencao cadastrar(DadosCadastroManutencao dados) {
    var veiculo = veiculoRepository.findById(dados.veiculoId())
            .orElseThrow(() -> new EntityNotFoundException("Veículo não encontrado com o ID: " + dados.veiculoId()));
    if (dados.status().equalsIgnoreCase("Agendada") && dados.date() != null) {
      if (dados.date().isBefore(LocalDate.now())) {
        throw new ValidationException("Para manutenção 'Agendada', a data deve ser no presente ou futuro.");
      }
    }
    if (dados.status().equalsIgnoreCase("Realizada")) {
      if (dados.currentKm() == null || dados.currentKm() <= 0) {
        throw new ValidationException("Para manutenção 'Realizada', a quilometragem atual é obrigatória e deve ser positiva.");
      }
      if (dados.proximaKm() != null && dados.proximaKm() <= dados.currentKm()) {
        throw new ValidationException("A próxima quilometragem deve ser superior à quilometragem atual da manutenção.");
      }
      Integer kmAtualVeiculo = veiculo.getCurrentKm() != null ? veiculo.getCurrentKm() : 0;
      if (dados.currentKm() > kmAtualVeiculo) {
        veiculo.setCurrentKm(dados.currentKm());
        veiculoRepository.save(veiculo);
      }
    } else {
      if (dados.currentKm() != null || dados.proximaKm() != null) {
        throw new ValidationException("Quilometragem atual e próxima quilometragem não devem ser informadas para manutenção 'Agendada'.");
      }
    }
    var manutencao = new Manutencao(dados, veiculo);
    manutencaoRepository.save(manutencao);
    if (dados.status().equalsIgnoreCase("Realizada") && dados.proximaKm() != null) {
      var dadosNovaManutencaoAgendada = new DadosCadastroManutencao(
              dados.veiculoId(),
              "Manutenção Agendada: " + dados.title(),
              dados.type(),
              null,
              BigDecimal.ZERO,
              "Agendada",
              dados.proximaKm(),
              null
      );
      var manutencaoAgendada = new Manutencao(dadosNovaManutencaoAgendada, veiculo);
      manutencaoRepository.save(manutencaoAgendada);
    }
    return new DadosDetalhamentoManutencao(manutencao);
  }
  @Transactional
  public DadosDetalhamentoManutencao atualizar(Long id, DadosAtualizacaoManutencao dados) {
    var manutencao = manutencaoRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Manutenção não encontrada com o ID: " + id));
    final Veiculo veiculoAtualizado;
    if (dados.veiculoId() != null && !dados.veiculoId().equals(manutencao.getVeiculo().getId())) {
      veiculoAtualizado = veiculoRepository.findById(dados.veiculoId())
              .orElseThrow(() -> new EntityNotFoundException("Veículo para atualização não encontrado com o ID: " + dados.veiculoId()));
    } else {
      veiculoAtualizado = manutencao.getVeiculo();
    }
    LocalDate dataParaValidarAtualizacao = (dados.date() != null) ? dados.date() : manutencao.getDate();
    String statusParaValidar = (dados.status() != null) ? dados.status() : manutencao.getStatus();
    if (statusParaValidar.equalsIgnoreCase("Agendada") && dataParaValidarAtualizacao != null) {
      if (dataParaValidarAtualizacao.isBefore(LocalDate.now())) {
        throw new ValidationException("Para manutenção 'Agendada', a data deve ser no presente ou futuro.");
      }
    }
    if (statusParaValidar.equalsIgnoreCase("Realizada") && dataParaValidarAtualizacao.isAfter(LocalDate.now())) {
      throw new ValidationException("Não é possível marcar uma manutenção como 'Realizada' com uma data futura.");
    }
    DadosAtualizacaoManutencao dadosParaAtualizarNaEntidade = dados;
    if (statusParaValidar.equalsIgnoreCase("Realizada")) {
      Integer currentKmAtualizado = dados.currentKm() != null ? dados.currentKm() : manutencao.getCurrentKm();
      Integer proximaKmAtualizado = dados.proximaKm() != null ? dados.proximaKm() : manutencao.getProximaKm();
      if (currentKmAtualizado == null || currentKmAtualizado <= 0) {
        throw new ValidationException("Para manutenção 'Realizada', a quilometragem atual é obrigatória e deve ser positiva.");
      }
      if (proximaKmAtualizado != null && proximaKmAtualizado <= currentKmAtualizado) {
        throw new ValidationException("A próxima quilometragem deve ser superior à quilometragem atual da manutenção.");
      }
      Integer kmAtualVeiculoAtualizado = veiculoAtualizado.getCurrentKm() != null ? veiculoAtualizado.getCurrentKm() : 0;
      if (currentKmAtualizado > kmAtualVeiculoAtualizado) {
        veiculoAtualizado.setCurrentKm(currentKmAtualizado);
        veiculoRepository.save(veiculoAtualizado);
      }
    } else {
      if (statusParaValidar.equalsIgnoreCase("Agendada")) {
        dadosParaAtualizarNaEntidade = new DadosAtualizacaoManutencao(
                dados.veiculoId(), dados.title(), dados.type(), dados.date(), dados.cost(), dados.status(),
                dados.currentKm(), null
        );
      } else {
        dadosParaAtualizarNaEntidade = new DadosAtualizacaoManutencao(
                dados.veiculoId(), dados.title(), dados.type(), dados.date(), dados.cost(), dados.status(),
                null, null
        );
      }
    }
    manutencao.atualizarInformacoes(dadosParaAtualizarNaEntidade, veiculoAtualizado);
    if (manutencao.getStatus().equalsIgnoreCase("Realizada") && manutencao.getProximaKm() != null) {
      var dadosNovaManutencaoAgendada = new DadosCadastroManutencao(
              manutencao.getVeiculo().getId(),
              "Manutenção Agendada: " + manutencao.getTitle(),
              manutencao.getType(),
              null,
              BigDecimal.ZERO,
              "Agendada",
              manutencao.getProximaKm(),
              null
      );
      var manutencaoAgendada = new Manutencao(dadosNovaManutencaoAgendada, veiculoAtualizado);
      manutencaoRepository.save(manutencaoAgendada);
    }
    return new DadosDetalhamentoManutencao(manutencao);
  }
  @Transactional
  public void excluir(Long id) {
    if (!manutencaoRepository.existsById(id)) {
      throw new EntityNotFoundException("Manutenção não encontrada com o ID: " + id);
    }
    manutencaoRepository.deleteById(id);
  }
}