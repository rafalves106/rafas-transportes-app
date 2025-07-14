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
@CrossOrigin(origins = "*")
public class ViagemController {

    @Autowired
    private ViagemService service;

    @PostMapping
    @Transactional
    public ResponseEntity cadastrar(@RequestBody @Valid DadosCadastroViagem dados, UriComponentsBuilder uriBuilder) {
        var viagem = service.cadastrar(dados);

        var uri = uriBuilder.path("/viagens/{id}").buildAndExpand(viagem.getId()).toUri();
        return ResponseEntity.created(uri).body(new DadosDetalhamentoViagem(viagem));
    }

    @GetMapping
    public ResponseEntity<List<DadosDetalhamentoViagem>> listar() {
        var lista = service.listarTodas();
        return ResponseEntity.ok(lista);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity atualizar(@PathVariable Long id, @RequestBody @Valid DadosAtualizacaoViagem dados) {
        var viagem = service.atualizar(id, dados);
        return ResponseEntity.ok(new DadosDetalhamentoViagem(viagem));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}