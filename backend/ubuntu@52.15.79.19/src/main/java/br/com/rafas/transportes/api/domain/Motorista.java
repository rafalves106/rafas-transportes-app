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
    private String nome;
    private LocalDate validadeCnh;
    private String telefone;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusMotorista status;

    public Motorista(br.com.rafas.transportes.api.dto.DadosCadastroMotorista dados) {
        this.nome = dados.nome();
        this.validadeCnh = dados.validadeCnh();
        this.telefone = dados.telefone();
        this.status = br.com.rafas.transportes.api.domain.StatusMotorista.ATIVO;
    }

    public void atualizarInformacoes(br.com.rafas.transportes.api.dto.DadosAtualizacaoMotorista dados) {
        if (dados.nome() != null) { this.nome = dados.nome(); }
        if (dados.telefone() != null) { this.telefone = dados.telefone(); }
        if (dados.validadeCnh() != null) { this.validadeCnh = dados.validadeCnh(); }
        if (dados.status() != null) { this.status = dados.status(); }
    }
}