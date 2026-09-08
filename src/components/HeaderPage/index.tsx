import './headerPage.style.css'

interface HeaderPageProps {
  title: string;
  subtitle: string;
}

export function HeaderPage({title, subtitle}: HeaderPageProps) {
  return (
    <header className="header-page">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  );
}