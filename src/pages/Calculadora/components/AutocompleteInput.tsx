import { useState, useEffect, useMemo, useRef } from "react";
import styled from "styled-components";
import { Input, Label, InputGroup } from "../../../components/ui/Form";
import cidadesJson from "../../../data/cidades.json";

const AutocompleteContainer = styled.div`
  position: relative;
`;

const SuggestionsList = styled.ul`
  position: absolute;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  list-style: none;
  padding: 0.25rem;
  margin-top: 0.25rem;
  width: 100%;
  z-index: 10;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
`;

const SuggestionItem = styled.li`
  padding: 0.75rem;
  cursor: pointer;
  border-radius: 4px;
  &:hover {
    background-color: var(--color-background);
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
  const [sugestoes, setSugestoes] = useState<string[]>([]);
  const [listaVisivel, setListaVisivel] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const todasAsCidadesComEstado = useMemo(() => {
    return cidadesJson.estados.flatMap((estado) =>
      estado.cidades.map((cidade) => `${cidade} - ${estado.sigla}`)
    );
  }, []);

  useEffect(() => {
    if (value.length < 2) {
      setSugestoes([]);
      return;
    }

    const textoDigitadoLimpo = removerAcentos(value);

    const filteredSugestoes = todasAsCidadesComEstado
      .filter((cidade) => {
        const nomeCidadeLimpo = removerAcentos(cidade);
        return nomeCidadeLimpo.includes(textoDigitadoLimpo);
      })
      .slice(0, 7);

    setSugestoes(filteredSugestoes);
  }, [value, todasAsCidadesComEstado]);

  useEffect(() => {
    const handleClickFora = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setListaVisivel(false);
      }
    };

    document.addEventListener("mousedown", handleClickFora);
    return () => {
      document.removeEventListener("mousedown", handleClickFora);
    };
  }, []);

  const handleSuggestionClick = (sugestao: string) => {
    onChange(sugestao);
    setListaVisivel(false);
  };

  const removerAcentos = (texto: string) =>
    texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  return (
    <InputGroup>
      {label && <Label>{label}</Label>}
      <AutocompleteContainer ref={containerRef}>
        <Input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setListaVisivel(true);
          }}
          placeholder={placeholder}
          autoComplete="off"
        />
        {listaVisivel && sugestoes.length > 0 && (
          <SuggestionsList>
            {sugestoes.map((sugestao) => (
              <SuggestionItem
                key={sugestao}
                onMouseDown={() => handleSuggestionClick(sugestao)}
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
