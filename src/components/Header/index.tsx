import { Bell } from "lucide-react";

import "./header.style.css";

export function Header() {
  return (
    <header className="header">
      <div>
        <h2>Olá, André 👋</h2>

        <p>
          Confira o resumo da sua oficina hoje.
        </p>
      </div>

      <div className="header-actions">
        <button className="notification-button">
          <Bell size={20} />
        </button>

        <div className="user-info">
          <div className="avatar">
            A
          </div>

          <div>
            <strong>Administrador</strong>
            <span>Administrador</span>
          </div>
        </div>
      </div>
    </header>
  );
}