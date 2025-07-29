/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.domain;

import br.com.rafas.transportes.api.dto.DadosAtualizacaoManutencao;
import br.com.rafas.transportes.api.dto.DadosCadastroManutencao;
import br.com.rafas.transportes.api.domain.veiculo.Veiculo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Table(name = "manutencoes")
@Entity(name = "Manutencao")
@Getter
@Setter
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

  @Column
  private LocalDate date;

  @Column(nullable = false)
  private BigDecimal cost;

  @Column(nullable = false)
  private String status;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "veiculo_id", nullable = false)
  private Veiculo veiculo;

  @Column(name = "current_km")
  private Integer currentKm;

  @Column(name = "proxima_km")
  private Integer proximaKm;

  @Column(name = "parent_maintenance_id")
  private Long parentMaintenanceId;

  public Manutencao(DadosCadastroManutencao dados, Veiculo veiculo) {
    this.title = dados.title();
    this.type = dados.type();
    this.date = dados.date();
    this.cost = dados.cost();
    this.status = dados.status();
    this.veiculo = veiculo;
    this.currentKm = dados.currentKm();
    this.proximaKm = dados.proximaKm();
    this.parentMaintenanceId = null;
  }

  public void atualizarInformacoes(DadosAtualizacaoManutencao dados, Veiculo veiculoAtualizado) {
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
    if (veiculoAtualizado != null) {
      this.veiculo = veiculoAtualizado;
    }
    if (dados.currentKm() != null) {
      this.currentKm = dados.currentKm();
    }
    if (dados.proximaKm() != null) {
      this.proximaKm = dados.proximaKm();
    }
  }
}