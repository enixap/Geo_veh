import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginRequest } from "../services/api";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token } = await loginRequest({ email, password });
      localStorage.setItem("jwt_token", token);
      const redirectTo = location.state?.from?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Échec de la connexion. Vérifiez vos identifiants."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h1>Connexion</h1>
      <p style={{ marginTop: "-0.4rem", marginBottom: "1.2rem", fontSize: "0.9rem", color: "#9ca3af" }}>
        Authentifiez-vous pour accéder au tableau de bord de suivi en temps réel.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="btn"
          disabled={loading}
          style={{ width: "100%", marginTop: "0.4rem" }}
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
        {error && <div className="error">{error}</div>}
      </form>
      <p style={{ marginTop: "1rem", fontSize: "0.78rem", color: "#6b7280" }}>
        Astuce : créez un utilisateur via l&apos;API{" "}
        <code>/api/auth/register</code> ou un script SQL, puis connectez-vous ici.
      </p>
    </div>
  );
}

export default LoginPage;

