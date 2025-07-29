/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.infra;

import jakarta.validation.ValidationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus; // Importe HttpStatus
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime; // Importe LocalDateTime

@RestControllerAdvice
public class TratadorDeErros {

    public record ErrorResponse(
            LocalDateTime timestamp,
            HttpStatus status,
            int statusCode,
            String error,
            String message
    ) {}

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> tratarErroRegraDeNegocio(ValidationException ex) {
        ErrorResponse errorBody = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST,
                HttpStatus.BAD_REQUEST.value(),
                "Erro de Validação",
                ex.getMessage()
        );
        return ResponseEntity.badRequest().body(errorBody);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity tratarErro400(MethodArgumentNotValidException ex) {
        var erros = ex.getFieldErrors();

        String mensagemErro = "Erro de validação nos campos: ";
        if (!erros.isEmpty()) {
            mensagemErro = erros.get(0).getDefaultMessage();
        }

        ErrorResponse errorBody = new ErrorResponse(
                java.time.LocalDateTime.now(),
                HttpStatus.BAD_REQUEST,
                HttpStatus.BAD_REQUEST.value(),
                "Validação de Campos",
                mensagemErro
        );

        return ResponseEntity.badRequest().body(errorBody);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity tratarErroDeIntegridade(DataIntegrityViolationException ex) {
        ErrorResponse errorBody = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST,
                HttpStatus.BAD_REQUEST.value(),
                "Erro de Integridade de Dados",
                "Este registro não pode ser excluído, pois está em uso por outra parte do sistema."
        );
        return ResponseEntity.badRequest().body(errorBody);
    }
}