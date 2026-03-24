import { useState } from "react";
import { authService } from "../services/authService";
import { Icons }       from "../components/shared/Icons";
import { Alert }       from "../components/shared/Alert";

export function LoginPage({ onLogin }) {
  const [form,    setForm]    = useState({ email: "", password: "" });
  const [err,     setErr]     = useState("");
  const [loading, setLoading] = useState(false);

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const d = await authService.login(form.email, form.password);
      onLogin(d.access_token);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <Icons.Chart />, text: "Dashboard con métricas en tiempo real" },
    { icon: <Icons.Brain />, text: "Predicción de demanda con inteligencia artificial" },
    { icon: <Icons.Send />,  text: "Alertas automáticas por Telegram" },
  ];

  return (
    <div className="inv-login">
      <div className="inv-login-left">
        <div className="inv-login-hero">
          <h1>Inventario<br /><em>Profesional</em></h1>
          <p>Sistema de gestión inteligente para tu negocio</p>
          <div className="inv-login-feats">
            {features.map((f, i) => (
              <div key={i} className="inv-login-feat">
                <div className="inv-login-feat-ico">{f.icon}</div>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="inv-login-right">
        <div className="inv-login-form-wrap">
          <h2>Bienvenido</h2>
          <p>Ingresa tus credenciales para acceder al sistema</p>
          <Alert msg={err} type="err" />
          <form className="inv-login-form" onSubmit={handleSubmit}>
            <div className="inv-fg">
              <label className="inv-label">Correo electrónico</label>
              <input className="inv-input" type="email" value={form.email} onChange={setField("email")} required placeholder="nombre@empresa.com" autoFocus />
            </div>
            <div className="inv-fg">
              <label className="inv-label">Contraseña</label>
              <input className="inv-input" type="password" value={form.password} onChange={setField("password")} required placeholder="••••••••" />
            </div>
            <button className="inv-btn inv-btn-primary inv-btn-lg" type="submit" disabled={loading} style={{ width: "100%", marginTop: 4 }}>
              {loading ? <span className="inv-spin" /> : "Ingresar →"}
            </button>
          </form>
          <p style={{ marginTop: 20, fontSize: "0.72rem", color: "var(--ink4)", textAlign: "center", lineHeight: 1.6 }}>
            ¿No tienes acceso? Contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  );
}
