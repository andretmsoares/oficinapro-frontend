import { LoginForm } from "../../components/LoginForm";

import "./login.style.css";

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<void>;
}

export function Login({ onLogin }: LoginProps) {
  return (
    <div className="login">
      <div className="login-container">
        <img className="logo" src="/logo.png" alt="Oficina Pro" />

        <div className="login-header">
          <h1 className="login-title">Seja Bem-vindo</h1>
          <p className="login-subtitle">Faça login para continuar</p>
        </div>

        <LoginForm onSubmit={onLogin} />
      </div>
    </div>
  );
}
