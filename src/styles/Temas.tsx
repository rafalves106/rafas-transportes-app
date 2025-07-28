interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  cardBackground: string;
  activeCardBackground: string;
  title: string;
  secondaryTitle: string;
  text: string;
  infoText: string;
  border: string;
  alert: string;
}

export interface Theme {
  name: "light" | "dark";
  colors: ThemeColors;
}

export const lightTheme: Theme = {
  name: "light",
  colors: {
    primary: "#62BDFF",
    secondary: "#16527D",
    background: "#F5FBFF",
    cardBackground: "#E8F3FB",
    activeCardBackground: "rgb(175, 222, 255)",
    title: "#000",
    secondaryTitle: "#929FA9",
    text: "#333333",
    infoText: "#E8F3FB",
    border: "#D6E0E8",
    alert: "#d9534f",
  },
};

export const darkTheme: Theme = {
  name: "dark",
  colors: {
    primary: "#007BFF",
    secondary: "#6C757D",
    background: "#1A1A1A",
    cardBackground: "#2B2B2B",
    activeCardBackground: "rgb(50, 80, 110)",
    title: "#F8F8F8",
    secondaryTitle: "#A9A9A9",
    text: "#E0E0E0",
    infoText: "#3E3E3E",
    border: "#4A4A4A",
    alert: "#D32F2F",
  },
};
