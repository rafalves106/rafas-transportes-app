package br.com.rafas.transportes.api.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor; // Mantenha esta anotação se quiser o construtor com TODOS os campos
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
@NoArgsConstructor // Para JPA
@EqualsAndHashCode(of = "id")
public class HorarioItemRota {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "item_rota_id", nullable = false)
  private ItemRotaColaborador itemRotaColaborador;

  @Column(nullable = false)
  private LocalDate dataInicio;
  @Column(nullable = false)
  private LocalTime inicio;
  @Column(nullable = false)
  private LocalDate dataFim;
  @Column(nullable = false)
  private LocalTime fim;

  // Adicione ou modifique este construtor para incluir 'itemRotaColaborador'
  // Este é o construtor que você deveria chamar do serviço
  public HorarioItemRota(ItemRotaColaborador itemRotaColaborador, LocalDate dataInicio, LocalTime inicio, LocalDate dataFim, LocalTime fim) {
    this.itemRotaColaborador = itemRotaColaborador; // ATENÇÃO AQUI!
    this.dataInicio = dataInicio;
    this.inicio = inicio;
    this.dataFim = dataFim;
    this.fim = fim;
  }
}