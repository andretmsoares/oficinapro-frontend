import { useState } from "react";
import "./loginForm.style.css";

interface LoginFormProps {
  onSubmit: (username: string, password: string) => Promise<void>;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      await onSubmit(username, password);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível realizar o login.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Usuário"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={loading}
        autoComplete="username"
      />

      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
        autoComplete="current-password"
      />

      {error && <span className="error">{error}</span>}

      <button type="submit" disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
