/**
 * @author falvesmac
 */

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

import java.time.LocalDate;
import java.math.BigDecimal; // NOVO IMPORT: Para BigDecimal
import java.util.List;

@Service
public class ManutencaoService {

  @Autowired
  private ManutencaoRepository manutencaoRepository;

  @Autowired
  private VeiculoRepository veiculoRepository;

  @Transactional
  public DadosDetalhamentoManutencao cadastrar(DadosCadastroManutencao dados) {
    var veiculo = veiculoRepository.findById(dados.veiculoId())
            .orElseThrow(() -> new EntityNotFoundException("Veículo não encontrado com o ID: " + dados.veiculoId()));

    // --- Validações de KM para Cadastro ---
    if (dados.status().equalsIgnoreCase("Realizada")) {
      if (dados.currentKm() == null || dados.currentKm() <= 0) {
        throw new ValidationException("Para manutenção 'Realizada', a quilometragem atual é obrigatória e deve ser positiva.");
      }
      if (dados.proximaKm() != null && dados.proximaKm() <= dados.currentKm()) {
        throw new ValidationException("A próxima quilometragem deve ser superior à quilometragem atual da manutenção.");
      }
      // Atualiza o currentKm do veículo se a manutenção for Realizada e o KM for maior
      if (dados.currentKm() > veiculo.getCurrentKm()) {
        veiculo.setCurrentKm(dados.currentKm());
        veiculoRepository.save(veiculo); // Salva a atualização do KM do veículo
      }
    } else { // Se o status for "Agendada", currentKm e proximaKm não devem ser preenchidos
      if (dados.currentKm() != null || dados.proximaKm() != null) {
        throw new ValidationException("Quilometragem atual e próxima quilometragem não devem ser informadas para manutenção 'Agendada'.");
      }
    }

    // Usa o construtor da entidade que recebe o DTO e o Veiculo
    var manutencao = new Manutencao(dados, veiculo);
    manutencaoRepository.save(manutencao);

    // --- Lógica para criar uma NOVA Manutenção Agendada ---
    if (dados.status().equalsIgnoreCase("Realizada") && dados.proximaKm() != null) {
      // Cria um NOVO DTO para a manutenção agendada
      var dadosNovaManutencaoAgendada = new DadosCadastroManutencao(
              dados.veiculoId(),
              "Manutenção Agendada: " + dados.title(),
              dados.type(),
              null, // Data nula para agendada (se o DTO permitir, caso contrário, use LocalDate.now())
              BigDecimal.ZERO,
              "Agendada",
              dados.proximaKm(), // O currentKm da nova agendada é a proximaKm da anterior
              null
      );

      // Usa o construtor da entidade Manutencao que aceita o DTO e o Veiculo
      var manutencaoAgendada = new Manutencao(dadosNovaManutencaoAgendada, veiculo);
      manutencaoRepository.save(manutencaoAgendada);
    }

    return new DadosDetalhamentoManutencao(manutencao);
  }

  @Transactional(readOnly = true)
  public List<DadosDetalhamentoManutencao> listarTodas() {
    return manutencaoRepository.findAll().stream()
            .map(DadosDetalhamentoManutencao::new)
            .toList();
  }

  @Transactional
  public DadosDetalhamentoManutencao atualizar(Long id, DadosAtualizacaoManutencao dados) {
    var manutencao = manutencaoRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Manutenção não encontrada com o ID: " + id));

    Veiculo veiculoAtualizado = null;
    if (dados.veiculoId() != null && !dados.veiculoId().equals(manutencao.getVeiculo().getId())) {
      veiculoAtualizado = veiculoRepository.findById(dados.veiculoId())
              .orElseThrow(() -> new EntityNotFoundException("Veículo para atualização não encontrado com o ID: " + dados.veiculoId()));
    } else {
      veiculoAtualizado = manutencao.getVeiculo();
    }

    // --- Validações de KM para Atualização ---
    // Usar uma nova variável para dados atualizados para evitar o erro de "final variável"
    DadosAtualizacaoManutencao dadosParaAtualizarNaEntidade = dados; // Inicia com os dados originais

    if (dados.status() != null && dados.status().equalsIgnoreCase("Realizada")) {
      LocalDate dataParaValidar = (dados.date() != null) ? dados.date() : manutencao.getDate();
      if (dataParaValidar.isAfter(LocalDate.now())) {
        throw new ValidationException("Não é possível marcar uma manutenção como 'Realizada' com uma data futura.");
      }

      Integer currentKmAtualizado = dados.currentKm() != null ? dados.currentKm() : manutencao.getCurrentKm();
      Integer proximaKmAtualizado = dados.proximaKm() != null ? dados.proximaKm() : manutencao.getProximaKm();

      if (currentKmAtualizado == null || currentKmAtualizado <= 0) {
        throw new ValidationException("Para manutenção 'Realizada', a quilometragem atual é obrigatória e deve ser positiva.");
      }
      if (proximaKmAtualizado != null && proximaKmAtualizado <= currentKmAtualizado) {
        throw new ValidationException("A próxima quilometragem deve ser superior à quilometragem atual da manutenção.");
      }
      // Atualiza o currentKm do veículo
      if (currentKmAtualizado > veiculoAtualizado.getCurrentKm()) {
        veiculoAtualizado.setCurrentKm(currentKmAtualizado);
        veiculoRepository.save(veiculoAtualizado);
      }
    } else { // Se o status for alterado para "Agendada" ou outro, ou se não for Realizada
      if (dados.status() != null && !dados.status().equalsIgnoreCase("Realizada")) {
        // Cria um NOVO DTO para 'dadosParaAtualizarNaEntidade' para zerar KM, evitando reatribuir o parametro 'dados'
        dadosParaAtualizarNaEntidade = new DadosAtualizacaoManutencao(
                dados.veiculoId(), dados.title(), dados.type(), dados.date(), dados.cost(), dados.status(),
                null, null // Zera currentKm e proximaKm
        );
      }
    }

    // Chama o método da entidade para atualizar as informações principais, usando a nova variável
    manutencao.atualizarInformacoes(dadosParaAtualizarNaEntidade, veiculoAtualizado);

    // --- Lógica para criar ou atualizar uma NOVA Manutenção Agendada na ATUALIZAÇÃO ---
    if (manutencao.getStatus().equalsIgnoreCase("Realizada") && manutencao.getProximaKm() != null) {
      var dadosNovaManutencaoAgendada = new DadosCadastroManutencao(
              manutencao.getVeiculo().getId(),
              "Manutenção Agendada: " + manutencao.getTitle(),
              manutencao.getType(),
              null, // Data nula para agendada
              BigDecimal.ZERO,
              "Agendada",
              manutencao.getProximaKm(),
              null
      );
      // Usa o construtor da entidade Manutencao que aceita o DTO e o Veiculo
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