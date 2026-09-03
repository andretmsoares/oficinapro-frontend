import "./loginForm.style.css";

export function LoginForm() {
    return (
    <form className="login-form">
        <input type="text" placeholder="Usuário" />
        <input type="password" placeholder="Senha" />
        <button type="submit">Entrar</button>
    </form>
)}