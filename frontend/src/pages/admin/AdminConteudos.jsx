import { Route, Routes } from "react-router-dom";
import ListaConteudos from "./ListaConteudos";
import FormularioConteudo from "./FormularioConteudo";

export default function AdminConteudos() {
  return (
    <Routes>
      <Route index element={<ListaConteudos />} />
      <Route path="novo" element={<FormularioConteudo />} />
      <Route path=":id/editar" element={<FormularioConteudo />} />
    </Routes>
  );
}
