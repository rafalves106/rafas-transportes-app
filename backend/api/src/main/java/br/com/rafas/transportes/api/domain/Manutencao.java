/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.domain;

import br.com.rafas.transportes.api.dto.DadosAtualizacaoManutencao;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Table(name = "manutencoes")
@Entity(name = "Manutencao")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Manutencao {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String title;

  @Column(nullable = false)
  private String type;

  @Column(nullable = false)
  private LocalDate date;

  @Column(nullable = false)
  private BigDecimal cost;

  @Column(nullable = false)
  private String status;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "veiculo_id", nullable = false)
  private Veiculo veiculo;

  public void atualizarInformacoes(DadosAtualizacaoManutencao dados) {
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
  }
}