import { LoginForm } from "../../components/LoginForm";

import "./login.style.css";
interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Simula validação e redireciona
    onLogin();
  }

  return (
    <div className="login">
        <div className="login-container" onSubmit={handleSubmit}>
            <img className="logo" src='/logo.png' alt='Oficina Pro' />
            <div className="login-header"> 
                <h1 className="login-title">Seja Bem vindo</h1>
                <p className="login-subtitle">Faça login para continuar</p>
            </div>
            <LoginForm />
        </div>
    </div>
  );
}