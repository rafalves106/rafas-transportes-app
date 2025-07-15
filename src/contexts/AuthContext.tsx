import { createContext, useState, useContext, type ReactNode } from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("jwtToken")
  );
  const isLoggedIn = !!token;

  const performLogout = () => {
    setToken(null);
    localStorage.removeItem("jwtToken");
  };

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem("jwtToken", newToken);
  };

  const logout = () => {
    performLogout();
  };

  const contextValue: AuthContextType = {
    isLoggedIn,
    token,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
