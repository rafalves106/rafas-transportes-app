package br.com.rafas.transportes.api.domain;

import br.com.rafas.transportes.api.dto.DadosAtualizacaoVeiculo;
import br.com.rafas.transportes.api.dto.DadosCadastroVeiculo;
import jakarta.persistence.*;
import lombok.*;

@Table(name = "veiculos")
@Entity(name = "Veiculo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Veiculo {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String model;
    private String plate;

    @Enumerated(EnumType.STRING)
    private StatusVeiculo status;

    public Veiculo(DadosCadastroVeiculo dados) {
        this.model = dados.model();
        this.plate = dados.plate();
        this.status = StatusVeiculo.ATIVO;
    }

    public void desativar() {
        this.status = StatusVeiculo.INATIVO;
    }

    public void atualizarInformacoes(DadosAtualizacaoVeiculo dados) {
        if (dados.model() != null) {
            this.model = dados.model();
        }
        if (dados.plate() != null) {
            this.plate = dados.plate();
        }
        if (dados.status() != null) {
            this.status = dados.status();
        }
    }
}