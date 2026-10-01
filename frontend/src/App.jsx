import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import NaoEncontrado from "./components/NaoEncontrado";
import SessaoLayout from "./contexto/SessaoLayout";

// Rotas carregadas sob demanda: o visitante da home comercial não baixa o
// bundle do /admin nem o shader WebGL, e vice-versa.
const HomeComercial = lazy(() => import("./marketing/HomeComercial"));
const FichaAssinatura = lazy(() => import("./onboarding/FichaAssinatura"));
const Cadastro = lazy(() => import("./onboarding/Cadastro"));
const Login = lazy(() => import("./onboarding/Login"));
const FichaAssinante = lazy(() => import("./onboarding/FichaAssinante"));
const Checkout = lazy(() => import("./onboarding/Checkout"));
const AssinaturaConfirmada = lazy(() => import("./onboarding/AssinaturaConfirmada"));
const CancelarAssinatura = lazy(() => import("./onboarding/CancelarAssinatura"));
const Capa = lazy(() => import("./reader/Capa"));
const Home = lazy(() => import("./reader/Home"));
const Sumario = lazy(() => import("./reader/Sumario"));
const Leitor = lazy(() => import("./reader/Leitor"));
const SeoArteTecnologia = lazy(() => import("./marketing/SeoArteTecnologia"));
const MotionCP = lazy(() => import("./motion/MotionCP"));
const AdminShell = lazy(() => import("./admin/AdminShell"));
const AdminLogin = lazy(() => import("./admin/AdminLogin"));
const Painel = lazy(() => import("./pages/admin/Painel"));
const AdminConteudos = lazy(() => import("./pages/admin/AdminConteudos"));
const Cartas = lazy(() => import("./pages/admin/Cartas"));

function Carregando() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--papel)",
        color: "var(--admin-apoio)",
        fontFamily: '"Space Mono", monospace',
        fontSize: 12,
        letterSpacing: "1.4px",
      }}
    >
      CARREGANDO…
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Carregando />}>
        <Routes>
          <Route path="/" element={<HomeComercial />} />
          <Route path="/inteligencia-artificial-na-arte-e-cultura" element={<SeoArteTecnologia />} />
          <Route path="/assinatura" element={<FichaAssinatura />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/login" element={<Login />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/assinatura-confirmada" element={<AssinaturaConfirmada />} />
          <Route path="/cancelar-assinatura" element={<CancelarAssinatura />} />
          <Route path="/motion" element={<MotionCP />} />

          <Route element={<SessaoLayout />}>
            <Route path="/assinante" element={<FichaAssinante />} />
            <Route path="/capa" element={<Capa />} />
            <Route path="/home" element={<Home />} />
            <Route path="/sumario" element={<Sumario />} />
            <Route path="/leitura/:id" element={<Leitor />} />
          </Route>

          <Route path="/admin" element={<Navigate to="/admin/painel" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/painel"
            element={
              <AdminShell>
                <Painel />
              </AdminShell>
            }
          />
          <Route
            path="/admin/conteudos/*"
            element={
              <AdminShell>
                <AdminConteudos />
              </AdminShell>
            }
          />
          <Route
            path="/admin/cartas"
            element={
              <AdminShell>
                <Cartas />
              </AdminShell>
            }
          />

          <Route path="*" element={<NaoEncontrado />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
