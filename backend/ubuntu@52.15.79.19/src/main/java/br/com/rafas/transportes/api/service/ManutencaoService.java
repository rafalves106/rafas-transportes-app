package br.com.rafas.transportes.api.service;

import br.com.rafas.transportes.api.domain.Manutencao;
import br.com.rafas.transportes.api.domain.veiculo.Veiculo;
import br.com.rafas.transportes.api.dto.DadosAtualizacaoManutencao;
import br.com.rafas.transportes.api.dto.DadosCadastroManutencao;
import br.com.rafas.transportes.api.dto.DadosDetalhamentoManutencao;
import br.com.rafas.transportes.api.dto.DadosCadastroQuilometragemLog;
import br.com.rafas.transportes.api.repository.ManutencaoRepository;
import br.com.rafas.transportes.api.repository.VeiculoRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ManutencaoService {

  @Autowired
  private ManutencaoRepository manutencaoRepository;

  @Autowired
  private VeiculoRepository veiculoRepository;

  @Autowired
  private QuilometragemLogService quilometragemLogService;

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

    // 1. Validações Iniciais baseadas no Status
    if (dados.status().equalsIgnoreCase("Realizada")) {
      // Validações para Manutenção Realizada
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
    } else if (dados.status().equalsIgnoreCase("Agendada")) {
      // Validações para Manutenção Agendada
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

    // 2. Criação e Salvamento da Manutenção Principal
    var novaManutencao = new Manutencao(dados, veiculo);
    // Para cadastro, parentMaintenanceId é sempre null, a menos que seja uma agendada filha de outra coisa
    novaManutencao.setParentMaintenanceId(null); // Garante que não tenha um ID pai neste momento
    manutencaoRepository.save(novaManutencao); // Salva a manutenção principal para obter seu ID

    // 3. Atualização da KM do Veículo e Registro de Log (APENAS se for Realizada e a KM do veículo for atualizada)
    if (novaManutencao.getStatus().equalsIgnoreCase("Realizada")) {
      Integer quilometragemAnteriorVeiculo = veiculo.getCurrentKm() != null ? veiculo.getCurrentKm() : 0;

      if (novaManutencao.getCurrentKm() > quilometragemAnteriorVeiculo) {
        veiculo.setCurrentKm(novaManutencao.getCurrentKm()); // Atualiza a KM do veículo
        veiculoRepository.save(veiculo); // Salva o veículo com a nova KM

        // REGISTRAR LOG: Manutenção Realizada atualizou a KM do veículo
        quilometragemLogService.registrarLog(new DadosCadastroQuilometragemLog(
                veiculo.getId(),
                LocalDateTime.now(),
                quilometragemAnteriorVeiculo,
                veiculo.getCurrentKm(),
                "MANUTENCAO",
                novaManutencao.getId() // ID da manutenção que causou a atualização
        ));
      }
    }

    // 4. Criação/Associação da Manutenção Agendada "Filha" (se a principal for Realizada e tiver proximaKm)
    if (novaManutencao.getStatus().equalsIgnoreCase("Realizada") && novaManutencao.getProximaKm() != null) {
      // Para cadastro, sempre criamos uma nova filha, pois não há uma mãe para ser atualizada
      var dadosNovaManutencaoAgendada = new DadosCadastroManutencao(
              novaManutencao.getVeiculo().getId(),
              "Manutenção Agendada: " + novaManutencao.getTitle(),
              novaManutencao.getType(),
              null, // Data nula para agendada
              novaManutencao.getCost(), // Custo replicado
              "Agendada",
              novaManutencao.getProximaKm(), // KM Ideal da filha é a ProximaKm da mãe
              null
      );
      var novaManutencaoAgendada = new Manutencao(dadosNovaManutencaoAgendada, veiculo);
      novaManutencaoAgendada.setParentMaintenanceId(novaManutencao.getId()); // Define o ID da mãe
      manutencaoRepository.save(novaManutencaoAgendada);
    }

    return new DadosDetalhamentoManutencao(novaManutencao);
  }

  @Transactional
  public DadosDetalhamentoManutencao atualizar(Long id, DadosAtualizacaoManutencao dados) {
    var manutencaoExistente = manutencaoRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Manutenção não encontrada com o ID: " + id));

    // Capturar KM anterior do veículo antes de qualquer alteração na manutenção
    Integer quilometragemAnteriorVeiculo = manutencaoExistente.getVeiculo().getCurrentKm() != null ? manutencaoExistente.getVeiculo().getCurrentKm() : 0;

    // Atualiza as informações da entidade de manutenção existente com os novos dados
    manutencaoExistente.atualizarInformacoes(dados, manutencaoExistente.getVeiculo()); // Passa o veículo atual se não mudou

    // Se o veículo mudou na atualização
    if (dados.veiculoId() != null && !dados.veiculoId().equals(manutencaoExistente.getVeiculo().getId())) {
      var novoVeiculo = veiculoRepository.findById(dados.veiculoId())
              .orElseThrow(() -> new EntityNotFoundException("Novo veículo para atualização não encontrado com o ID: " + dados.veiculoId()));
      manutencaoExistente.atualizarInformacoes(dados, novoVeiculo); // Atualiza também o veículo na manutenção
      // Se o veículo foi trocado, a KM atual do veículo anterior não é mais relevante aqui.
      // A lógica de log abaixo vai usar a KM do novo veículo.
    }


    // 1. Validações baseadas no Status e nos novos dados
    if (manutencaoExistente.getStatus().equalsIgnoreCase("Realizada")) {
      // Validações para Manutenção Realizada
      if (manutencaoExistente.getCost() == null || manutencaoExistente.getCost().compareTo(BigDecimal.ZERO) <= 0) {
        throw new ValidationException("Para manutenção 'Realizada', o custo é obrigatório e deve ser positivo.");
      }
      if (manutencaoExistente.getDate() == null) {
        throw new ValidationException("Para manutenção 'Realizada', a data é obrigatória.");
      }
      if (manutencaoExistente.getDate().isAfter(LocalDate.now())) {
        throw new ValidationException("Não é possível marcar uma manutenção como 'Realizada' com uma data futura.");
      }
      if (manutencaoExistente.getCurrentKm() == null || manutencaoExistente.getCurrentKm() <= 0) {
        throw new ValidationException("Para manutenção 'Realizada', a quilometragem atual é obrigatória e deve ser positiva.");
      }
      if (manutencaoExistente.getProximaKm() != null && manutencaoExistente.getProximaKm() <= manutencaoExistente.getCurrentKm()) {
        throw new ValidationException("A próxima quilometragem deve ser superior à quilometragem atual da manutenção.");
      }
    } else if (manutencaoExistente.getStatus().equalsIgnoreCase("Agendada")) {
      // Validações para Manutenção Agendada
      if (manutencaoExistente.getDate() != null && manutencaoExistente.getDate().isBefore(LocalDate.now())) {
        throw new ValidationException("Para manutenção 'Agendada', a data deve ser no presente ou futuro.");
      }
      if (manutencaoExistente.getCurrentKm() == null || manutencaoExistente.getCurrentKm() <= 0) {
        throw new ValidationException("A KM ideal para a troca é obrigatória para manutenção agendada e deve ser positiva.");
      }
      if (dados.proximaKm() != null) { // Usa dados.proximaKm() diretamente da requisição
        throw new ValidationException("Próxima quilometragem não deve ser informada para manutenção 'Agendada'.");
      }
      if (manutencaoExistente.getCost() != null && manutencaoExistente.getCost().compareTo(BigDecimal.ZERO) < 0) {
        throw new ValidationException("O custo, se informado para manutenção agendada, deve ser um número válido e não negativo.");
      }
    }

    // 2. Salvamento da Manutenção Principal (com os dados já atualizados na entidade)
    manutencaoRepository.save(manutencaoExistente);

    // 3. Atualização da KM do Veículo e Registro de Log (APENAS se for Realizada e a KM do veículo for atualizada)
    if (manutencaoExistente.getStatus().equalsIgnoreCase("Realizada")) {
      Integer kmAtualVeiculo = manutencaoExistente.getVeiculo().getCurrentKm() != null ? manutencaoExistente.getVeiculo().getCurrentKm() : 0;

      // ATENÇÃO: currentKm da manutenção já foi atualizada na entidade 'manutencaoExistente'
      if (manutencaoExistente.getCurrentKm() > kmAtualVeiculo) { // Se a KM da manutenção é maior, atualiza o veículo
        veiculoRepository.findById(manutencaoExistente.getVeiculo().getId())
                .ifPresent(v -> { // Encontra o veículo novamente para garantir que é a instância gerenciada
                  v.setCurrentKm(manutencaoExistente.getCurrentKm());
                  veiculoRepository.save(v);

                  // REGISTRAR LOG: Manutenção Realizada atualizou a KM do veículo
                  quilometragemLogService.registrarLog(new DadosCadastroQuilometragemLog(
                          v.getId(),
                          LocalDateTime.now(),
                          quilometragemAnteriorVeiculo, // KM anterior do veículo
                          v.getCurrentKm(), // Nova KM do veículo
                          "MANUTENCAO",
                          manutencaoExistente.getId() // ID da manutenção que causou a atualização
                  ));
                });
      }
    }

    // 4. Lógica de Manutenção Agendada "Filha" (Criação/Atualização/Deleção)
    // Revalidar o status da manutenção existente após a atualização, se necessário.
    if (manutencaoExistente.getStatus().equalsIgnoreCase("Realizada")) {
      Optional<Manutencao> manutencaoAgendadaFilhaOpt = manutencaoRepository.findByParentMaintenanceIdAndStatus(manutencaoExistente.getId(), "Agendada");

      if (manutencaoExistente.getProximaKm() != null) { // Se a mãe tem proximaKm
        if (manutencaoAgendadaFilhaOpt.isPresent()) {
          // Atualiza a filha existente
          Manutencao manutencaoAgendadaExistente = manutencaoAgendadaFilhaOpt.get();
          manutencaoAgendadaExistente.setTitle("Manutenção Agendada: " + manutencaoExistente.getTitle());
          manutencaoAgendadaExistente.setType(manutencaoExistente.getType());
          manutencaoAgendadaExistente.setCurrentKm(manutencaoExistente.getProximaKm());
          manutencaoAgendadaExistente.setCost(manutencaoExistente.getCost());
          manutencaoRepository.save(manutencaoAgendadaExistente);
        } else {
          // Cria uma nova filha
          var dadosNovaManutencaoAgendada = new DadosCadastroManutencao(
                  manutencaoExistente.getVeiculo().getId(),
                  "Manutenção Agendada: " + manutencaoExistente.getTitle(),
                  manutencaoExistente.getType(),
                  null,
                  manutencaoExistente.getCost(),
                  "Agendada",
                  manutencaoExistente.getProximaKm(),
                  null
          );
          var novaManutencaoAgendada = new Manutencao(dadosNovaManutencaoAgendada, manutencaoExistente.getVeiculo());
          novaManutencaoAgendada.setParentMaintenanceId(manutencaoExistente.getId());
          manutencaoRepository.save(novaManutencaoAgendada);
        }
      } else { // Se a mãe NÃO tem proximaKm (foi removida)
        if (manutencaoAgendadaFilhaOpt.isPresent()) {
          // Deleta a filha existente
          manutencaoRepository.delete(manutencaoAgendadaFilhaOpt.get());
        }
      }
    } else { // Se o status da mãe NÃO é "Realizada" (ex: mudou para Agendada ou outro)
      Optional<Manutencao> manutencaoAgendadaFilhaOpt = manutencaoRepository.findByParentMaintenanceIdAndStatus(id, "Agendada");
      if (manutencaoAgendadaFilhaOpt.isPresent()) {
        manutencaoRepository.delete(manutencaoAgendadaFilhaOpt.get());
      }
    }

    return new DadosDetalhamentoManutencao(manutencaoExistente);
  }

  @Transactional
  public void excluir(Long id) {
    if (!manutencaoRepository.existsById(id)) {
      throw new EntityNotFoundException("Manutenção não encontrada com o ID: " + id);
    }
    // Lógica para excluir manutenção agendada "filha" se a "mãe" for excluída
    Optional<Manutencao> manutencaoAgendadaFilhaOpt = manutencaoRepository.findByParentMaintenanceIdAndStatus(id, "Agendada");
    if (manutencaoAgendadaFilhaOpt.isPresent()) {
      manutencaoRepository.delete(manutencaoAgendadaFilhaOpt.get());
    }
    manutencaoRepository.deleteById(id);
  }
}