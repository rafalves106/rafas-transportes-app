/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Table(name = "orcamentos")
@Entity(name = "Orcamento")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Orcamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomeCliente;
    private String telefone;
    private LocalDate dataDoOrcamento;
    private String origem;
    private String destino;
    private String distancia;
    private BigDecimal valorTotal;
    private String paradas;

    private String tipoViagemOrcamento;
    @Column(columnDefinition = "TEXT")
    private String descricaoIdaOrcamento;
    @Column(columnDefinition = "TEXT")
    private String descricaoVoltaOrcamento;

    @Column(columnDefinition = "TEXT")
    private String textoGerado;

}