import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        border: none;
        outline: none;
        font-family: 'Poppins', sans-serif;
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
    
    body {
        background-color: var(--cor-de-fundo);
        color: var(--cor-titulos);
    }

    :root {
        --cor-primaria: #62BDFF;
        --cor-secundaria: #16527D;
        --cor-de-fundo: #F5FBFF;
        --cor-de-fundo-cards: #E8F3FB;
        --cor-de-fundo-cards-ativo:rgb(175, 222, 255);
        --cor-titulos: #000;
        --cor-titulos-secundaria: #929FA9;
        --cor-textos: #333333;
        --cor-textos-infos: #E8F3FB;
        --cor-bordas: #D6E0E8;
        --cor-remover: #d9534f;
    } 
`;
