/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter; // Para permitir que o JPA popule e que o pai possa setar a referência

import java.time.LocalTime;

@Entity
@Table(name = "horarios_itens_rota") // Nome da tabela no banco de dados
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class HorarioItemRota {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // Referência ao ItemRotaColaborador pai (muitos horários para um item de rota)
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "item_rota_id", nullable = false)
  private ItemRotaColaborador itemRotaColaborador;

  @Column(nullable = false)
  private LocalTime inicio;

  @Column(nullable = false)
  private LocalTime fim;

  // Construtor sem ID e sem a referência ao pai, para ser usado com DTO
  public HorarioItemRota(LocalTime inicio, LocalTime fim) {
    this.inicio = inicio;
    this.fim = fim;
  }
}