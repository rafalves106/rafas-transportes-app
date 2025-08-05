/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Table(name = "ferias")
@Entity(name = "Ferias")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Ferias {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "motorista_id")
    private Motorista motorista;

    private LocalDate dataInicio;

    private LocalDate dataFim;

    public Ferias(Motorista motorista, LocalDate dataInicio, LocalDate dataFim) {
        this.motorista = motorista;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
    }
}