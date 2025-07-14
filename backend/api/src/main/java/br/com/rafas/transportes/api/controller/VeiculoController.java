package br.com.rafas.transportes.api.controller;

import br.com.rafas.transportes.api.dto.DadosAtualizacaoVeiculo;
import br.com.rafas.transportes.api.dto.DadosCadastroVeiculo;
import br.com.rafas.transportes.api.dto.DadosDetalhamentoVeiculo;
import br.com.rafas.transportes.api.repository.VeiculoRepository;
import br.com.rafas.transportes.api.service.VeiculoService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;
import br.com.rafas.transportes.api.repository.ManutencaoRepository;
import jakarta.validation.ValidationException;

import java.util.List;

@RestController
@RequestMapping("/api/veiculos")
public class VeiculoController {

    @Autowired
    private VeiculoService service;

    @Autowired
    private VeiculoRepository repository;

    @Autowired
    private ManutencaoRepository manutencaoRepository;

    @GetMapping
    public ResponseEntity<List<DadosDetalhamentoVeiculo>> listar() {
        var listaDTO = repository.findAll().stream().map(DadosDetalhamentoVeiculo::new).toList();
        return ResponseEntity.ok(listaDTO);
    }

    @PostMapping
    @Transactional
    public ResponseEntity cadastrar(@RequestBody @Valid DadosCadastroVeiculo dados, UriComponentsBuilder uriBuilder) {
        var veiculo = service.cadastrar(dados);

        var uri = uriBuilder.path("/api/veiculos/{id}").buildAndExpand(veiculo.getId()).toUri();
        return ResponseEntity.created(uri).body(new DadosDetalhamentoVeiculo(veiculo));
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
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}