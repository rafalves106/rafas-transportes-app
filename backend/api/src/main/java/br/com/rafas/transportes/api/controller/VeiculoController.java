package br.com.rafas.transportes.api.controller;

import br.com.rafas.transportes.api.model.DadosAtualizacaoVeiculo;
import br.com.rafas.transportes.api.model.DadosCadastroVeiculo;
import br.com.rafas.transportes.api.model.DadosDetalhamentoVeiculo;
import br.com.rafas.transportes.api.model.Veiculo;
import br.com.rafas.transportes.api.repository.VeiculoRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/veiculos")
public class VeiculoController {

    @Autowired
    private VeiculoRepository repository;

    @GetMapping
    public ResponseEntity<List<DadosDetalhamentoVeiculo>> listar() {
        var listaDTO = repository.findAll().stream().map(DadosDetalhamentoVeiculo::new).toList();
        return ResponseEntity.ok(listaDTO);
    }

    @PostMapping
    @Transactional
    public void cadastrar(@RequestBody @Valid DadosCadastroVeiculo dados) {
        repository.save(new Veiculo(dados));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<DadosDetalhamentoVeiculo> atualizar(@PathVariable Long id, @RequestBody @Valid DadosAtualizacaoVeiculo dados) {
        var veiculo = repository.getReferenceById(id);
        veiculo.atualizarInformacoes(dados);
        return ResponseEntity.ok(new DadosDetalhamentoVeiculo(veiculo));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity excluir(@PathVariable Long id) {
        var veiculo = repository.getReferenceById(id);
        veiculo.desativar();
        return ResponseEntity.noContent().build();
    }
}