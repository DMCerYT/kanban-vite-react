import { useState } from "react";
import { Icon } from "./Icons";
import { hasSupabaseConfig, supabase } from "../lib/supabaseClient";

export function AuthPanel() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setBusy(true);

    try {
      const authCall = mode === "login"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password });
      const { error } = await authCall;
      if (error) throw error;
      setMessage(mode === "login" ? "Sesion iniciada." : "Cuenta creada. Revisa tu email si Supabase requiere confirmacion.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  if (!hasSupabaseConfig) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true">
              <Icon name="board" />
            </div>
            <div>
              <h1>Kanban Personal</h1>
              <span>Configura Supabase</span>
            </div>
          </div>
          <p className="auth-copy">Faltan las variables de entorno para conectar la base de datos.</p>
          <pre className="code-block">VITE_SUPABASE_URL=https://ftqworwgmvpkohohautr.supabase.co{"\n"}VITE_SUPABASE_ANON_KEY=...</pre>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <Icon name="board" />
          </div>
          <div>
            <h1>Kanban Personal</h1>
            <span>{mode === "login" ? "Iniciar sesion" : "Crear cuenta"}</span>
          </div>
        </div>

        <div className="field">
          <label htmlFor="authEmail">Email</label>
          <input className="input" id="authEmail" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="authPassword">Password</label>
          <input className="input" id="authPassword" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength="6" value={password} onChange={(event) => setPassword(event.target.value)} />
        </div>

        {message && <p className="auth-message">{message}</p>}

        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Procesando..." : mode === "login" ? "Entrar" : "Crear cuenta"}
        </button>
        <button className="link-button" type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
          {mode === "login" ? "Crear una cuenta" : "Ya tengo cuenta"}
        </button>
      </form>
    </main>
  );
}
