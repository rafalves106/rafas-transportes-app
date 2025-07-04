import { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { Input, Label, InputGroup } from "../../../components/ui/Form";
import cidadesJson from "../../../data/cidades.json";

const AutocompleteContainer = styled.div`
  position: relative;
`;
const SuggestionsList = styled.ul`
  position: absolute;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  list-style: none;
  padding: 0.25rem;
  margin-top: 0.25rem;
  width: 100%;
  z-index: 10;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
`;
const SuggestionItem = styled.li`
  padding: 0.75rem;
  cursor: pointer;
  border-radius: 4px;
  &:hover {
    background-color: #f1f3f5;
  }
`;

interface AutocompleteProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function AutocompleteInput({
  label,
  value,
  onChange,
  placeholder,
}: AutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [sugestoes, setSugestoes] = useState<string[]>([]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const todasAsCidadesComEstado = useMemo(() => {
    return cidadesJson.estados.flatMap((estado) =>
      estado.cidades.map((cidade) => `${cidade} - ${estado.sigla}`)
    );
  }, []);

  useEffect(() => {
    if (inputValue.length < 2) {
      setSugestoes([]);
      return;
    }

    const textoDigitadoLimpo = removerAcentos(inputValue); // Limpa o que o usuário digitou

    const filteredSugestoes = todasAsCidadesComEstado
      .filter((cidade) => {
        const nomeCidadeLimpo = removerAcentos(cidade);
        return nomeCidadeLimpo.includes(textoDigitadoLimpo);
      })
      .slice(0, 7);

    setSugestoes(filteredSugestoes);
  }, [inputValue, todasAsCidadesComEstado]);

  const handleSuggestionClick = (sugestao: string) => {
    onChange(sugestao);
    setInputValue(sugestao);
    setSugestoes([]);
  };

  const removerAcentos = (texto: string) =>
    texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  return (
    <InputGroup>
      {label && <Label>{label}</Label>}
      <AutocompleteContainer>
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
        />
        {sugestoes.length > 0 && (
          <SuggestionsList>
            {sugestoes.map((sugestao) => (
              <SuggestionItem
                key={sugestao}
                onClick={() => handleSuggestionClick(sugestao)}
              >
                {sugestao}
              </SuggestionItem>
            ))}
          </SuggestionsList>
        )}
      </AutocompleteContainer>
    </InputGroup>
  );
}
