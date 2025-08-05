/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.domain.veiculo.log;

import br.com.rafas.transportes.api.domain.veiculo.Veiculo;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Table(name = "quilometragem_log")
@Entity(name = "QuilometragemLog")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class QuilometragemLog {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "veiculo_id", nullable = false)
  private Veiculo veiculo;

  @Column(name = "data_hora_registro", nullable = false)
  private LocalDateTime dataHoraRegistro;

  @Column(name = "quilometragem_anterior", nullable = false)
  private Integer quilometragemAnterior;

  @Column(name = "quilometragem_atual", nullable = false)
  private Integer quilometragemAtual;

  @Column(name = "origem_alteracao", nullable = false)
  private String origemAlteracao;

  @Column(name = "id_referencia_origem")
  private Long idReferenciaOrigem;
}