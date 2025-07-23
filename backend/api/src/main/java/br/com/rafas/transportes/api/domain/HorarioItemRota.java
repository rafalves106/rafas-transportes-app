package br.com.rafas.transportes.api.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "horarios_itens_rota")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class HorarioItemRota {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "item_rota_id", nullable = false)
  private ItemRotaColaborador itemRotaColaborador;

  @Column(nullable = false)
  private LocalDate dataInicio; // Data de início do período do horário

  @Column(nullable = false)
  private LocalTime inicio;

  @Column(nullable = false)
  private LocalDate dataFim;    // Data de fim do período do horário

  @Column(nullable = false)
  private LocalTime fim;

  public HorarioItemRota(LocalDate dataInicio, LocalTime inicio, LocalDate dataFim, LocalTime fim) {
    this.dataInicio = dataInicio;
    this.inicio = inicio;
    this.dataFim = dataFim;
    this.fim = fim;
  }
}