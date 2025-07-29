package br.com.rafas.transportes.api.service;

import br.com.rafas.transportes.api.repository.MotoristaRepository;
import br.com.rafas.transportes.api.repository.OrcamentoRepository;
import br.com.rafas.transportes.api.repository.VeiculoRepository;
import br.com.rafas.transportes.api.repository.ViagemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

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

  @Autowired
  private OrcamentoRepository orcamentoRepository;

  @Autowired
  private OrcamentoService orcamentoService;

  @Override
  public void run(String... args) throws Exception {
    /*
    if (viagemRepository.count() == 0 && veiculoRepository.count() == 0 && motoristaRepository.count() == 0) {
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

      String origem1 = "Belo Horizonte";
      String destino1 = "São Paulo";
      String paradas1 = "Parada em Pouso Alegre";
      String tipoViagem1 = "ida_e_volta_fora_mg";

      String descricaoIda1 = String.format("Saída de %s, destino %s. %s",
              origem1, destino1, paradas1.isEmpty() ? "" : "Com paradas em: " + paradas1);
      String descricaoVolta1 = String.format("Retorno de %s para %s. %s",
              destino1, origem1, paradas1.isEmpty() ? "" : "Com paradas em: " + paradas1);

      DadosCadastroOrcamento orcamento1 = new DadosCadastroOrcamento(
              "João da Silva",
              "(31) 98765-4321",
              origem1,
              destino1,
              "400 km",
              paradas1,
              new BigDecimal("2500.00"),
              tipoViagem1,
              descricaoIda1,
              descricaoVolta1
      );
      orcamentoService.salvar(orcamento1);

      String origem2 = "Rio de Janeiro";
      String destino2 = "Aeroporto de Confins";
      String paradas2 = "";
      String tipoViagem2 = "fretamento_aeroporto";

      String descricaoIda2 = String.format("Percurso: de %s para %s.", origem2, destino2);
      String descricaoVolta2 = tipoViagem2.equals("fretamento_aeroporto") ?
              String.format("Busca em %s e retorno para %s.", destino2, origem2) : "";


      DadosCadastroOrcamento orcamento2 = new DadosCadastroOrcamento(
              "Maria Oliveira",
              "(21) 91234-5678",
              origem2,
              destino2,
              "440 km",
              paradas2,
              new BigDecimal("2800.00"),
              tipoViagem2,
              descricaoIda2,
              descricaoVolta2
      );
      orcamentoService.salvar(orcamento2);


      String origem3 = "Belo Horizonte";
      String destino3 = "Ouro Preto";
      String paradas3 = "Parada em Mariana";
      String tipoViagem3 = "somente_ida_mg";

      String descricaoIda3 = String.format("Percurso somente de ida: de %s para %s. %s",
              origem3, destino3, paradas3.isEmpty() ? "" : "Com parada em: " + paradas3);
      String descricaoVolta3 = "";

      DadosCadastroOrcamento orcamento3 = new DadosCadastroOrcamento(
              "Pedro Costa",
              "(31) 97777-6666",
              origem3,
              destino3,
              "100 km",
              paradas3,
              new BigDecimal("750.00"),
              tipoViagem3,
              descricaoIda3,
              descricaoVolta3
      );
      orcamentoService.salvar(orcamento3);

      System.out.println(">>> Dados de teste cadastrados com sucesso!");
    }
  }
     */
}}