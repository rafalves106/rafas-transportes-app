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
import java.util.List;

@Service
public class ManutencaoService {

  @Autowired
  private ManutencaoRepository manutencaoRepository;

  @Autowired
  private VeiculoRepository veiculoRepository;

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
      // ... (sua lógica existente de validação de KM para Realizada) ...
      if (dados.currentKm() == null || dados.currentKm() <= 0) {
        throw new ValidationException("Para manutenção 'Realizada', a quilometragem atual é obrigatória e deve ser positiva.");
      }
      if (dados.proximaKm() != null && dados.proximaKm() <= dados.currentKm()) {
        throw new ValidationException("A próxima quilometragem deve ser superior à quilometragem atual da manutenção.");
      }
      if (dados.currentKm() > veiculo.getCurrentKm()) {
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

    // --- Lógica para criar uma NOVA Manutenção Agendada (existente) ---
    if (dados.status().equalsIgnoreCase("Realizada") && dados.proximaKm() != null) {
      // ... (sua lógica existente para criar a nova manutenção agendada) ...
    }

    return new DadosDetalhamentoManutencao(manutencao);
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

    // --- NOVA VALIDAÇÃO CONDICIONAL PARA A DATA NA ATUALIZAÇÃO ---
    // A data usada para validação é a do DTO, ou a existente se não alterada
    LocalDate dataParaValidarAtualizacao = (dados.date() != null) ? dados.date() : manutencao.getDate();
    String statusParaValidar = (dados.status() != null) ? dados.status() : manutencao.getStatus();

    if (statusParaValidar.equalsIgnoreCase("Agendada") && dataParaValidarAtualizacao != null) {
      if (dataParaValidarAtualizacao.isBefore(LocalDate.now())) {
        throw new ValidationException("Para manutenção 'Agendada', a data deve ser no presente ou futuro.");
      }
    }
    // A validação para status "Realizada" que impede data futura já existe.

    // --- Validações de KM para Atualização (existente) ---
    if (statusParaValidar.equalsIgnoreCase("Realizada")) { // Usa statusParaValidar
      LocalDate dataParaValidar = (dados.date() != null) ? dados.date() : manutencao.getDate(); // Esta é a data da manutenção sendo atualizada
      if (dataParaValidar.isAfter(LocalDate.now())) { // Já existe no seu código, mas repete a validação
        throw new ValidationException("Não é possível marcar uma manutenção como 'Realizada' com uma data futura.");
      }

      // ... (o restante da sua lógica existente de validação de KM para Realizada na atualização) ...
    } else {
      // ... (lógica existente para zerar KMs se não for Realizada) ...
    }

    // Chama o método da entidade para atualizar as informações, passando o veículo atualizado
    DadosAtualizacaoManutencao dadosParaAtualizarNaEntidade = dados; // Mantido para o erro de 'final variável'
    if (dados.status() != null && !dados.status().equalsIgnoreCase("Realizada") && !dados.status().equalsIgnoreCase("Agendada")) {
      // Se o status for alterado para algo diferente de Realizada ou Agendada
      // Você pode querer zerar KMs aqui também, dependendo dos seus status.
    }
    if (dados.status() != null && !dados.status().equalsIgnoreCase("Realizada")) {
      // Se o status foi alterado para algo diferente de Realizada, zera KMs no DTO
      // Isso é crucial para que os campos null sejam enviados para o backend
      dadosParaAtualizarNaEntidade = new DadosAtualizacaoManutencao(
              dados.veiculoId(), dados.title(), dados.type(), dados.date(), dados.cost(), dados.status(),
              null, null
      );
    }


    manutencao.atualizarInformacoes(dadosParaAtualizarNaEntidade, veiculoAtualizado);


    // --- Lógica para criar ou atualizar uma NOVA Manutenção Agendada na ATUALIZAÇÃO (existente) ---
    if (manutencao.getStatus().equalsIgnoreCase("Realizada") && manutencao.getProximaKm() != null) {
      // ... (sua lógica existente para criar nova manutenção agendada na atualização) ...
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