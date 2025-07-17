package br.com.rafas.transportes.api.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    private Veiculo veiculo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private Motorista motorista;

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