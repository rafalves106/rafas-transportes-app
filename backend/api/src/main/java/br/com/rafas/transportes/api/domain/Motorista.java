/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Table(name = "motoristas")
@Entity(name = "Motorista")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Motorista {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    private LocalDate validadeCnh;

    private String telefone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusMotorista status;

}