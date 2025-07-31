/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.service;

import br.com.rafas.transportes.api.domain.Ferias;
import br.com.rafas.transportes.api.domain.Motorista;
import br.com.rafas.transportes.api.dto.DadosCadastroFerias;
import br.com.rafas.transportes.api.repository.FeriasRepository;
import br.com.rafas.transportes.api.repository.MotoristaRepository;
import br.com.rafas.transportes.api.repository.ViagemRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FeriasService {

  @Autowired
  private FeriasRepository feriasRepository;

  @Autowired
  private MotoristaRepository motoristaRepository;

  @Autowired
  private ViagemRepository viagemRepository;

  @Transactional
  public Ferias cadastrar(DadosCadastroFerias dados) {
    Motorista motorista = motoristaRepository.findById(dados.motoristaId())
            .orElseThrow(() -> new EntityNotFoundException("Motorista não encontrado."));

    if (dados.dataInicio().isAfter(dados.dataFim())) {
      throw new ValidationException("A data de início das férias não pode ser posterior à data de fim.");
    }

    if (feriasRepository.existeConflitoDeFerias(
            dados.motoristaId(),
            dados.dataInicio(),
            dados.dataFim()
    )) {
      throw new ValidationException("Já existe um período de férias cadastrado para este motorista nas datas selecionadas.");
    }

    if (viagemRepository.existeViagemEmPeriodo(
            dados.motoristaId(),
            dados.dataInicio(),
            dados.dataFim()
    )) {
      throw new ValidationException("O motorista tem uma viagem agendada no período das férias. Cancele a viagem ou ajuste as datas.");
    }

    Ferias novaFerias = new Ferias(motorista, dados.dataInicio(), dados.dataFim());
    return feriasRepository.save(novaFerias);
  }
}