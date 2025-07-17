package br.com.rafas.transportes.api.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "viagens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Viagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Enumerated(EnumType.STRING)
    private TipoViagem tipoViagem;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "viagem_veiculos",
            joinColumns = @JoinColumn(name = "viagem_id"),
            inverseJoinColumns = @JoinColumn(name = "veiculo_id")
    )
    private Set<Veiculo> veiculos = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "viagem_motoristas",
            joinColumns = @JoinColumn(name = "viagem_id"),
            inverseJoinColumns = @JoinColumn(name = "motorista_id")
    )
    private Set<Motorista> motoristas = new HashSet<>();

    private LocalDate startDate;
    private LocalTime startTime;
    private LocalDate endDate;
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    private StatusViagem status;

    private String clientName;

    private String telefone;

    private java.math.BigDecimal valor;

    @Column(columnDefinition = "TEXT")
    private String startLocation;

    @Column(columnDefinition = "TEXT")
    private String endLocation;
}