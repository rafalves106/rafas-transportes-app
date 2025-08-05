/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.controller;

import br.com.rafas.transportes.api.dto.DadosAtualizacaoMotorista;
import br.com.rafas.transportes.api.dto.DadosCadastroMotorista;
import br.com.rafas.transportes.api.dto.DadosDetalhamentoMotorista;
import br.com.rafas.transportes.api.service.MotoristaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@RestController
@RequestMapping("/motoristas")
@CrossOrigin(origins = "*")
public class MotoristaController {

    @Autowired
    private MotoristaService service;

    @PostMapping
    @Transactional
    public ResponseEntity cadastrar(@RequestBody @Valid DadosCadastroMotorista dados, UriComponentsBuilder uriBuilder) {
        var motorista = service.cadastrar(dados);

        var uri = uriBuilder.path("/motoristas/{id}").buildAndExpand(motorista.getId()).toUri();

        return ResponseEntity.created(uri).body(new DadosDetalhamentoMotorista(motorista));
    }

    @GetMapping
    public ResponseEntity<List<DadosDetalhamentoMotorista>> listar() {
        var lista = service.listarTodos();
        return ResponseEntity.ok(lista);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity atualizar(@PathVariable Long id, @RequestBody @Valid DadosAtualizacaoMotorista dados) {
        var motorista = service.atualizar(id, dados);
        return ResponseEntity.ok(new DadosDetalhamentoMotorista(motorista));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}