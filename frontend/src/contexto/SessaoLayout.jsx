import { Outlet } from "react-router-dom";
import { SessaoProvider } from "./SessaoContext";

export default function SessaoLayout() {
  return (
    <SessaoProvider>
      <Outlet />
    </SessaoProvider>
  );
}
