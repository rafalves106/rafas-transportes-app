package br.com.rafas.transportes.api.domain;

import br.com.rafas.transportes.api.dto.DadosAtualizacaoViagem;
import br.com.rafas.transportes.api.dto.DadosCadastroViagem;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "viagens")
@Getter
@NoArgsConstructor // Construtor padrão exigido pelo JPA
@AllArgsConstructor // Construtor com todos os campos (útil para testes, etc.)
@EqualsAndHashCode(of = "id")
public class Viagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false) // Garante que veiculo é obrigatório
    private Veiculo veiculo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false) // Garante que motorista é obrigatório
    private Motorista motorista;

    private LocalDate startDate;
    private LocalTime startTime;
    private LocalDate endDate;
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false) // Status é obrigatório
    private StatusViagem status;

    private String clientName;
    private String telefone;
    private BigDecimal valor; // Usar BigDecimal para valores monetários

    @Column(columnDefinition = "TEXT", nullable = false) // Local de início é obrigatório
    private String startLocation;

    @Column(columnDefinition = "TEXT") // Local de fim pode ser opcional
    private String endLocation;

    // --- NOVO CONSTRUTOR PARA CADASTRO A PARTIR DO DTO ---
    public Viagem(DadosCadastroViagem dados, Veiculo veiculo, Motorista motorista) {
        this.title = dados.title();
        this.clientName = dados.clientName();
        this.telefone = dados.telefone();
        this.valor = dados.valor();
        this.startLocation = dados.startLocation();
        this.endLocation = dados.endLocation();
        this.veiculo = veiculo;
        this.motorista = motorista;
        this.startDate = dados.startDate();
        this.startTime = dados.startTime();
        this.endDate = dados.endDate();
        this.endTime = dados.endTime();
        this.status = StatusViagem.AGENDADA; // Status inicial padrão
    }

    // --- MÉTODO DE ATUALIZAÇÃO DE INFORMAÇÕES (APÓS REMOVER @Setter) ---
    public void atualizarInformacoes(DadosAtualizacaoViagem dados, Veiculo veiculoAtualizado, Motorista motoristaAtualizado) {
        if (dados.title() != null) {
            this.title = dados.title();
        }
        if (dados.clientName() != null) {
            this.clientName = dados.clientName();
        }
        if (dados.telefone() != null) {
            this.telefone = dados.telefone();
        }
        if (dados.valor() != null) {
            this.valor = dados.valor();
        }
        if (dados.startLocation() != null) {
            this.startLocation = dados.startLocation();
        }
        if (dados.endLocation() != null) {
            this.endLocation = dados.endLocation();
        }
        if (dados.startDate() != null) {
            this.startDate = dados.startDate();
        }
        if (dados.startTime() != null) {
            this.startTime = dados.startTime();
        }
        if (dados.endDate() != null) {
            this.endDate = dados.endDate();
        }
        if (dados.endTime() != null) {
            this.endTime = dados.endTime();
        }
        if (dados.status() != null) {
            this.status = dados.status(); // Permite atualizar o status
        }
        // Atualiza as referências de veículo e motorista se forem fornecidas
        if (veiculoAtualizado != null) {
            this.veiculo = veiculoAtualizado;
        }
        if (motoristaAtualizado != null) {
            this.motorista = motoristaAtualizado;
        }
    }
}