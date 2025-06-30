import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        border: none;
        outline: none;
        font-family: 'Poppins', sans-serif;
    }

    :root {
        --cor-primaria: #62BDFF;
        --cor-secundaria: #16527D;
        --cor-de-fundo: #F5FBFF;
        --cor-de-fundo-cards: #E8F3FB;
        --cor-de-fundo-cards-ativo: rgb(175, 222, 255);
        --cor-titulos: #000;
        --cor-titulos-secundaria: #929FA9;
        --cor-textos: #333333;
        --cor-textos-infos: #E8F3FB;
        --cor-bordas: #D6E0E8;
        --cor-remover: #d9534f;
    } 
    
    body {
        background-color: var(--cor-de-fundo);
        color: var(--cor-titulos);
    }

    ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }

    ::-webkit-scrollbar-track {
        background: transparent;
    }

    ::-webkit-scrollbar-thumb {
        background: #cccccc;
        border-radius: 10px;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
    }
`;
