import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obterAssinanteAtual } from "../api/client";
import { lerToken, limparToken } from "../onboarding/sessao";

const SessaoContext = createContext(null);

export function SessaoProvider({ children }) {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const token = lerToken();
    if (!token) {
      setCarregando(false);
      return;
    }
    obterAssinanteAtual(token)
      .then(setUsuario)
      .catch(() => {
        limparToken();
        setUsuario(null);
      })
      .finally(() => setCarregando(false));
  }, []);

  const sair = useCallback(() => {
    limparToken();
    setUsuario(null);
    navigate("/");
  }, [navigate]);

  return (
    <SessaoContext.Provider value={{ usuario, setUsuario, carregando, sair }}>
      {children}
    </SessaoContext.Provider>
  );
}

export function useSessao() {
  const contexto = useContext(SessaoContext);
  if (!contexto) {
    throw new Error("useSessao precisa ser usado dentro de um SessaoProvider");
  }
  return contexto;
}
