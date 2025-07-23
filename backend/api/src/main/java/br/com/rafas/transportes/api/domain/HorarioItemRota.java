package br.com.rafas.transportes.api.domain;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor; // Mantenha esta!
import lombok.Setter; // Mantenha esta!

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "horarios_itens_rota")
@Getter
@Setter
@NoArgsConstructor // O Hibernate/JPA usa este construtor padrão
@EqualsAndHashCode(of = "id")
// Remova @AllArgsConstructor se ele estiver gerando um construtor que não é usado
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

}