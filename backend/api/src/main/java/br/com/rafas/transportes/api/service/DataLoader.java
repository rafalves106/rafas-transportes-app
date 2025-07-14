package br.com.rafas.transportes.api.service;

import br.com.rafas.transportes.api.domain.Motorista;
import br.com.rafas.transportes.api.domain.StatusMotorista;
import br.com.rafas.transportes.api.domain.StatusVeiculo;
import br.com.rafas.transportes.api.domain.Veiculo;
import br.com.rafas.transportes.api.dto.DadosCadastroManutencao;
import br.com.rafas.transportes.api.dto.DadosCadastroViagem;
import br.com.rafas.transportes.api.repository.MotoristaRepository;
import br.com.rafas.transportes.api.repository.VeiculoRepository;
import br.com.rafas.transportes.api.repository.ViagemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Component
public class DataLoader implements CommandLineRunner {

  @Autowired
  private MotoristaRepository motoristaRepository;

  @Autowired
  private VeiculoRepository veiculoRepository;

  @Autowired
  private ViagemRepository viagemRepository;

  @Autowired
  private ViagemService viagemService;

  @Autowired
  private ManutencaoService manutencaoService;

  @Override
  public void run(String... args) throws Exception {
    if (viagemRepository.count() == 0) {
      System.out.println(">>> Nenhum dado de teste encontrado, populando o banco de dados...");

      Motorista motoristaPadrao = new Motorista();
      motoristaPadrao.setNome("Carlos Silva (Padrão)");
      motoristaPadrao.setTelefone("(31) 99999-8888");
      motoristaPadrao.setCnh("12345678900");
      motoristaPadrao.setCpf("111.222.333-44");
      motoristaPadrao.setValidadeCnh(LocalDate.now().plusYears(2));
      motoristaPadrao.setStatus(StatusMotorista.ATIVO);
      Motorista motoristaSalvo = motoristaRepository.save(motoristaPadrao);

      Motorista motoristaPadrao2 = new Motorista();
      motoristaPadrao2.setNome("Sergio Pereira (Padrão)");
      motoristaPadrao2.setTelefone("(31) 99999-8888");
      motoristaPadrao2.setCnh("121212121");
      motoristaPadrao2.setCpf("123.267.356-89");
      motoristaPadrao2.setValidadeCnh(LocalDate.now().plusYears(2));
      motoristaPadrao2.setStatus(StatusMotorista.ATIVO);
      Motorista motoristaSalvo2 = motoristaRepository.save(motoristaPadrao2);

      Veiculo veiculoPadrao = new Veiculo();
      veiculoPadrao.setModel("Sprinter 416 (Padrão)");
      veiculoPadrao.setPlate("TST-0001");
      veiculoPadrao.setAno("2023");
      veiculoPadrao.setColor("Branca");
      veiculoPadrao.setRenavam("12345678901");
      veiculoPadrao.setStatus(StatusVeiculo.ATIVO);
      Veiculo veiculoSalvo = veiculoRepository.save(veiculoPadrao);

      Veiculo veiculoPadrao2 = new Veiculo();
      veiculoPadrao2.setModel("Sprinter 417 (Padrão)");
      veiculoPadrao2.setPlate("QPR-0001");
      veiculoPadrao2.setAno("2025");
      veiculoPadrao2.setColor("Branca");
      veiculoPadrao2.setRenavam("1234566789");
      veiculoPadrao2.setStatus(StatusVeiculo.ATIVO);
      Veiculo veiculoSalvo2 = veiculoRepository.save(veiculoPadrao2);

      DadosCadastroViagem dadosViagem = new DadosCadastroViagem(
              "Viagem de Teste (Padrão)",
              "Cliente Exemplo",
              "(31) 91234-5678",
              new BigDecimal("1250.50"),
              "Origem Teste",
              "Destino Teste",
              veiculoSalvo.getId(),
              motoristaSalvo.getId(),
              LocalDate.now().plusDays(10),
              LocalTime.of(8, 0),
              LocalDate.now().plusDays(12),
              LocalTime.of(18, 0)
      );
      viagemService.cadastrar(dadosViagem);

      DadosCadastroManutencao dadosManutencao = new DadosCadastroManutencao(
              veiculoSalvo.getId(),
              "Troca de Óleo (Padrão)",
              "Preventiva",
              LocalDate.now().plusDays(5),
              new BigDecimal("450.00"),
              "Agendada"
      );
      manutencaoService.cadastrar(dadosManutencao);

      System.out.println(">>> Dados de teste cadastrados com sucesso!");
    }
  }
}