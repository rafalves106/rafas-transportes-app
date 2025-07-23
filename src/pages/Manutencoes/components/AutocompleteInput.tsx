import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import {
  Input,
  Label,
  InputGroup,
  ErrorMessage,
} from "../../../components/ui/Form"; // Ajuste o caminho conforme sua estrutura UI

// Estilos para o autocomplete
const AutocompleteContainer = styled.div`
  position: relative;
  width: 100%;
  /* NOVO: Min-height para garantir que o container ocupe o espaço */
  min-height: 40px; /* Ajuste este valor se seu Input tiver altura diferente */
  overflow: visible;
`;

const SuggestionsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background-color: #fff;
  max-height: 150px;
  overflow-y: auto;
  position: absolute;
  z-index: 1000;
  width: 100%;
  /* NOVO: 'top' agora pode ser 100% (diretamente abaixo do input) */
  top: 100%;
  left: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SuggestionItem = styled.li`
  padding: 0.5rem 1rem;
  cursor: pointer;
  &:hover {
    background-color: #e9ecef;
  }
`;

interface AutocompleteInputProps {
  label?: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  suggestionsList: string[];
  hasError?: boolean;
  errorMessage?: string;
}

const removeAccents = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export function AutocompleteInput({
  label,
  id,
  name,
  value,
  onChange,
  placeholder,
  suggestionsList,
  hasError,
  errorMessage,
}: AutocompleteInputProps) {
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value.length < 2) {
      setFilteredSuggestions([]);
      return;
    }

    const normalizedValue = removeAccents(value.toLowerCase());
    const suggestions = suggestionsList
      .filter((item) =>
        removeAccents(item.toLowerCase()).includes(normalizedValue)
      )
      .slice(0, 7);

    setFilteredSuggestions(suggestions);
  }, [value, suggestionsList]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(
          `[data-autocomplete-list="${id}"]`
        )
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [id]);

  const handleInputChangeInternal = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange(e);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    const syntheticEvent = {
      target: { name, value: suggestion, type: "text" },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
    setFilteredSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <InputGroup>
      {label && <Label htmlFor={id}>{label}</Label>}
      <AutocompleteContainer>
        <Input
          id={id}
          name={name}
          type="text"
          value={value}
          onChange={handleInputChangeInternal}
          placeholder={placeholder}
          autoComplete="off"
          hasError={hasError}
          ref={inputRef}
        />
        {hasError && errorMessage && (
          <ErrorMessage>{errorMessage}</ErrorMessage>
        )}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <SuggestionsList data-autocomplete-list={id}>
            {filteredSuggestions.map((sugestao) => (
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
