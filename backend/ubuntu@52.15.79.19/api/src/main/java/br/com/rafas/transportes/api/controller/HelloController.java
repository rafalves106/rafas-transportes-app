/**
 * @author falvesmac
 */

package br.com.rafas.transportes.api.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/hello")

public class HelloController {

    @GetMapping
    public String olaMundo(){
        return "Olá, Mundo! A API da Rafas Transportes está no ar!";
    }

}