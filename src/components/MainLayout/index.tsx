import type { ReactNode } from "react";

import { Header } from "../Header";
import { Sidebar } from "../Sidebar";

import "./mainLayout.style.css";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({
  children,
}: MainLayoutProps) {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content">
        <Header />

        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}