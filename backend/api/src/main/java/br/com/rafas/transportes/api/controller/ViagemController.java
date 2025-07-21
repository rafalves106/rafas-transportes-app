package br.com.rafas.transportes.api.controller;

import br.com.rafas.transportes.api.dto.DadosAtualizacaoViagem;
import br.com.rafas.transportes.api.dto.DadosCadastroViagem;
import br.com.rafas.transportes.api.dto.DadosDetalhamentoViagem;
import br.com.rafas.transportes.api.service.ViagemService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@RestController
@RequestMapping("/viagens")
@CrossOrigin(origins = "*") // Se o CORS já é tratado globalmente no SecurityConfigurations, esta linha é redundante
public class ViagemController {

    @Autowired
    private ViagemService service;

    @PostMapping
    @Transactional
    public ResponseEntity<DadosDetalhamentoViagem> cadastrar(@RequestBody @Valid DadosCadastroViagem dados, UriComponentsBuilder uriBuilder) {
        // service.cadastrar agora retorna DadosDetalhamentoViagem
        var viagemDetalhada = service.cadastrar(dados);

        // Acessa o ID usando o método de record: .id()
        var uri = uriBuilder.path("/viagens/{id}").buildAndExpand(viagemDetalhada.id()).toUri();

        // Já é um DadosDetalhamentoViagem, não precisa criar um novo
        return ResponseEntity.created(uri).body(viagemDetalhada);
    }

    @GetMapping
    public ResponseEntity<List<DadosDetalhamentoViagem>> listar() {
        var lista = service.listarTodas();
        return ResponseEntity.ok(lista);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<DadosDetalhamentoViagem> atualizar(@PathVariable Long id, @RequestBody @Valid DadosAtualizacaoViagem dados) {
        // service.atualizar agora retorna DadosDetalhamentoViagem
        var viagemDetalhada = service.atualizar(id, dados);

        // Já é um DadosDetalhamentoViagem, não precisa criar um novo
        return ResponseEntity.ok(viagemDetalhada);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}