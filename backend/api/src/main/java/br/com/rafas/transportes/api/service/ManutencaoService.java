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
import java.util.Optional;
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
    if (dados.status().equalsIgnoreCase("Realizada")) {
      if (dados.cost() == null || dados.cost().compareTo(BigDecimal.ZERO) <= 0) {
        throw new ValidationException("Para manutenção 'Realizada', o custo é obrigatório e deve ser positivo.");
      }
      if (dados.date() == null) {
        throw new ValidationException("Para manutenção 'Realizada', a data é obrigatória.");
      }
      if (dados.date().isAfter(LocalDate.now())) {
        throw new ValidationException("Não é possível marcar uma manutenção como 'Realizada' com uma data futura.");
      }
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
    } else if (dados.status().equalsIgnoreCase("Agendada")) {
      if (dados.date() != null && dados.date().isBefore(LocalDate.now())) {
        throw new ValidationException("Para manutenção 'Agendada', a data deve ser no presente ou futuro.");
      }
      if (dados.currentKm() == null || dados.currentKm() <= 0) {
        throw new ValidationException("A KM ideal para a troca é obrigatória para manutenção agendada e deve ser positiva.");
      }
      if (dados.proximaKm() != null) {
        throw new ValidationException("Próxima quilometragem não deve ser informada para manutenção 'Agendada'.");
      }
      if (dados.cost() != null && dados.cost().compareTo(BigDecimal.ZERO) < 0) {
        throw new ValidationException("O custo, se informado para manutenção agendada, deve ser um número válido e não negativo.");
      }
    }
    var manutencao = new Manutencao(dados, veiculo);
    manutencao.setParentMaintenanceId(null);
    manutencaoRepository.save(manutencao);
    if (dados.status().equalsIgnoreCase("Realizada") && dados.proximaKm() != null) {
      var dadosNovaManutencaoAgendada = new DadosCadastroManutencao(
              dados.veiculoId(),
              "Manutenção Agendada: " + dados.title(),
              dados.type(),
              null,
              dados.cost(),
              "Agendada",
              dados.proximaKm(),
              null
      );
      var manutencaoAgendada = new Manutencao(dadosNovaManutencaoAgendada, veiculo);
      manutencaoAgendada.setParentMaintenanceId(manutencao.getId());
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
    LocalDate dataAtualParaValidar = (dados.date() != null) ? dados.date() : manutencao.getDate();
    String statusAtualParaValidar = (dados.status() != null) ? dados.status() : manutencao.getStatus();
    BigDecimal custoAtualParaValidar = (dados.cost() != null) ? dados.cost() : manutencao.getCost();
    Integer currentKmAtualParaValidar = (dados.currentKm() != null) ? dados.currentKm() : manutencao.getCurrentKm();
    Integer proximaKmAtualParaValidar = (dados.proximaKm() != null) ? dados.proximaKm() : manutencao.getProximaKm();
    DadosAtualizacaoManutencao dadosParaAtualizarNaEntidade = dados;
    if (statusAtualParaValidar.equalsIgnoreCase("Realizada")) {
      if (custoAtualParaValidar == null || custoAtualParaValidar.compareTo(BigDecimal.ZERO) <= 0) {
        throw new ValidationException("Para manutenção 'Realizada', o custo é obrigatório e deve ser positivo.");
      }
      if (dataAtualParaValidar == null) {
        throw new ValidationException("Para manutenção 'Realizada', a data é obrigatória.");
      }
      if (dataAtualParaValidar.isAfter(LocalDate.now())) {
        throw new ValidationException("Não é possível marcar uma manutenção como 'Realizada' com uma data futura.");
      }
      if (currentKmAtualParaValidar == null || currentKmAtualParaValidar <= 0) {
        throw new ValidationException("Para manutenção 'Realizada', a quilometragem atual é obrigatória e deve ser positiva.");
      }
      if (proximaKmAtualParaValidar != null && proximaKmAtualParaValidar <= currentKmAtualParaValidar) {
        throw new ValidationException("A próxima quilometragem deve ser superior à quilometragem atual da manutenção.");
      }
      Integer kmAtualVeiculoAtualizado = veiculoAtualizado.getCurrentKm() != null ? veiculoAtualizado.getCurrentKm() : 0;
      if (currentKmAtualParaValidar > kmAtualVeiculoAtualizado) {
        veiculoAtualizado.setCurrentKm(currentKmAtualParaValidar);
        veiculoRepository.save(veiculoAtualizado);
      }
    } else if (statusAtualParaValidar.equalsIgnoreCase("Agendada")) {
      if (dataAtualParaValidar != null && dataAtualParaValidar.isBefore(LocalDate.now())) {
        throw new ValidationException("Para manutenção 'Agendada', a data deve ser no presente ou futuro.");
      }
      if (currentKmAtualParaValidar == null || currentKmAtualParaValidar <= 0) {
        throw new ValidationException("A KM ideal para a troca é obrigatória para manutenção agendada e deve ser positiva.");
      }
      if (dados.proximaKm() != null) {
        throw new ValidationException("Próxima quilometragem não deve ser informada para manutenção 'Agendada'.");
      }
      if (custoAtualParaValidar != null && custoAtualParaValidar.compareTo(BigDecimal.ZERO) < 0) {
        throw new ValidationException("O custo, se informado para manutenção agendada, deve ser um número válido e não negativo.");
      }
      dadosParaAtualizarNaEntidade = new DadosAtualizacaoManutencao(
              dados.veiculoId(),
              dados.title(),
              dados.type(),
              dados.date(),
              dados.cost(),
              dados.status(),
              (dados.currentKm() != null ? dados.currentKm() : currentKmAtualParaValidar),
              null
      );
    }
    manutencao.atualizarInformacoes(dadosParaAtualizarNaEntidade, veiculoAtualizado);
    if (manutencao.getStatus().equalsIgnoreCase("Realizada")) {
      Optional<Manutencao> manutencaoAgendadaFilhaOpt = manutencaoRepository.findByParentMaintenanceIdAndStatus(manutencao.getId(), "Agendada");
      if (manutencao.getProximaKm() != null) {
        if (manutencaoAgendadaFilhaOpt.isPresent()) {
          Manutencao manutencaoAgendadaExistente = manutencaoAgendadaFilhaOpt.get();
          manutencaoAgendadaExistente.setTitle("Manutenção Agendada: " + manutencao.getTitle());
          manutencaoAgendadaExistente.setType(manutencao.getType());
          manutencaoAgendadaExistente.setCurrentKm(manutencao.getProximaKm());
          manutencaoAgendadaExistente.setCost(manutencao.getCost());
          manutencaoRepository.save(manutencaoAgendadaExistente);
        } else {
          var dadosNovaManutencaoAgendada = new DadosCadastroManutencao(
                  manutencao.getVeiculo().getId(),
                  "Manutenção Agendada: " + manutencao.getTitle(),
                  manutencao.getType(),
                  null,
                  manutencao.getCost(),
                  "Agendada",
                  manutencao.getProximaKm(),
                  null
          );
          var novaManutencaoAgendada = new Manutencao(dadosNovaManutencaoAgendada, veiculoAtualizado);
          novaManutencaoAgendada.setParentMaintenanceId(manutencao.getId());
          manutencaoRepository.save(novaManutencaoAgendada);
        }
      } else {
        if (manutencaoAgendadaFilhaOpt.isPresent()) {
          manutencaoRepository.delete(manutencaoAgendadaFilhaOpt.get());
        }
      }
    } else {
      Optional<Manutencao> manutencaoAgendadaFilhaOpt = manutencaoRepository.findByParentMaintenanceIdAndStatus(manutencao.getId(), "Agendada");
      if (manutencaoAgendadaFilhaOpt.isPresent()) {
        manutencaoRepository.delete(manutencaoAgendadaFilhaOpt.get());
      }
    }
    return new DadosDetalhamentoManutencao(manutencao);
  }
  @Transactional
  public void excluir(Long id) {
    if (!manutencaoRepository.existsById(id)) {
      throw new EntityNotFoundException("Manutenção não encontrada com o ID: " + id);
    }
    Optional<Manutencao> manutencaoAgendadaFilhaOpt = manutencaoRepository.findByParentMaintenanceIdAndStatus(id, "Agendada");
    if (manutencaoAgendadaFilhaOpt.isPresent()) {
      manutencaoRepository.delete(manutencaoAgendadaFilhaOpt.get());
    }
    manutencaoRepository.deleteById(id);
  }
}