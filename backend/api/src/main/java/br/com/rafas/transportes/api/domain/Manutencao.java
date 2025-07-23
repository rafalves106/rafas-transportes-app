/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.domain;

import br.com.rafas.transportes.api.dto.DadosAtualizacaoManutencao;
import br.com.rafas.transportes.api.dto.DadosCadastroManutencao; // NOVO IMPORT: Para o construtor de cadastro
import jakarta.persistence.*;
import lombok.AllArgsConstructor; // Manter para construtor com todos os campos (incluindo novos)
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter; // NOVO: Para os setters dos novos campos e em atualizarInformacoes

import java.math.BigDecimal;
import java.time.LocalDate;

@Table(name = "manutencoes")
@Entity(name = "Manutencao")
@Getter
@Setter // ADICIONADO: Para que os setters sejam gerados e usados nos métodos de atualização
@NoArgsConstructor
@AllArgsConstructor // Este construtor precisará ser ajustado pelo Lombok para incluir os novos campos
@EqualsAndHashCode(of = "id")
public class Manutencao {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String title;

  @Column(nullable = false)
  private String type; // Assumindo que este campo é "Preventiva" ou "Corretiva"

  @Column(nullable = false)
  private LocalDate date;

  @Column(nullable = false)
  private BigDecimal cost;

  @Column(nullable = false)
  private String status; // Assumindo que este campo é "Agendada" ou "Realizada"

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "veiculo_id", nullable = false)
  private Veiculo veiculo;

  // NOVO CAMPO: Quilometragem no momento da realização desta manutenção
  @Column(name = "current_km")
  private Integer currentKm; // Pode ser null se a manutenção não foi realizada ainda ou não se aplica

  // NOVO CAMPO: Quilometragem para a próxima manutenção agendada (se aplicável)
  @Column(name = "proxima_km")
  private Integer proximaKm; // Pode ser null se não houver próxima agendada

  // NOVO CONSTRUTOR para cadastro (chamado do service)
  public Manutencao(DadosCadastroManutencao dados, Veiculo veiculo) {
    this.title = dados.title();
    this.type = dados.type();
    this.date = dados.date();
    this.cost = dados.cost();
    this.status = dados.status();
    this.veiculo = veiculo;
    // Atribui os novos campos, permitindo que sejam nulos se não fornecidos no DTO
    this.currentKm = dados.currentKm();
    this.proximaKm = dados.proximaKm();
  }

  public void atualizarInformacoes(DadosAtualizacaoManutencao dados, Veiculo veiculoAtualizado) { // NOVO: Adicionado veiculoAtualizado
    if (dados.title() != null) {
      this.title = dados.title();
    }
    if (dados.type() != null) {
      this.type = dados.type();
    }
    if (dados.date() != null) {
      this.date = dados.date();
    }
    if (dados.cost() != null) {
      this.cost = dados.cost();
    }
    if (dados.status() != null) {
      this.status = dados.status();
    }
    // NOVO: Atualiza o veículo se houver mudança de ID no DTO
    if (veiculoAtualizado != null) {
      this.veiculo = veiculoAtualizado;
    }
    // NOVO: Atualiza a quilometragem atual da manutenção
    if (dados.currentKm() != null) {
      this.currentKm = dados.currentKm();
    }
    // NOVO: Atualiza a próxima quilometragem agendada
    if (dados.proximaKm() != null) {
      this.proximaKm = dados.proximaKm();
    }
  }
}