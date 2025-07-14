/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.infra;

import jakarta.validation.ValidationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class TratadorDeErros {

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity tratarErroRegraDeNegocio(ValidationException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity tratarErro400(MethodArgumentNotValidException ex) {
        var erros = ex.getFieldErrors();

        String primeiraMensagemDeErro = erros.get(0).getDefaultMessage();

        return ResponseEntity.badRequest().body(primeiraMensagemDeErro);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity tratarErroDeIntegridade(DataIntegrityViolationException ex) {
        return ResponseEntity.badRequest().body("Este registro não pode ser excluído, pois está em uso por outra parte do sistema.");
    }
}