package br.com.rafas.transportes.api.controller; // Movi para o pacote controller

import br.com.rafas.transportes.api.dto.DadosAtualizacaoManutencao;
import br.com.rafas.transportes.api.dto.DadosCadastroManutencao;
import br.com.rafas.transportes.api.dto.DadosDetalhamentoManutencao;
import br.com.rafas.transportes.api.service.ManutencaoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@RestController
@RequestMapping("/manutencoes")
@CrossOrigin(origins = "*")
public class ManutencaoController {

    @Autowired
    private ManutencaoService manutencaoService;

    @PostMapping
    @Transactional
    public ResponseEntity<DadosDetalhamentoManutencao> cadastrar(@RequestBody @Valid DadosCadastroManutencao dados, UriComponentsBuilder uriBuilder) {
        DadosDetalhamentoManutencao manutencaoDetalhada = manutencaoService.cadastrar(dados);
        var uri = uriBuilder.path("/manutencoes/{id}").buildAndExpand(manutencaoDetalhada.id()).toUri();
        return ResponseEntity.created(uri).body(manutencaoDetalhada);
    }

    @GetMapping
    public ResponseEntity<List<DadosDetalhamentoManutencao>> listar() {
        var lista = manutencaoService.listarTodas();
        return ResponseEntity.ok(lista);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<DadosDetalhamentoManutencao> atualizar(@PathVariable Long id, @RequestBody @Valid DadosAtualizacaoManutencao dados) {
        var manutencaoAtualizada = manutencaoService.atualizar(id, dados);
        return ResponseEntity.ok(manutencaoAtualizada);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        manutencaoService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}