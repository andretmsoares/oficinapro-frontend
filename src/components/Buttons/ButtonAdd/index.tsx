import "./buttonAdd.style.css";
import "../btn.style.css";

interface ButtonAddProps {
  onClick: () => void;
  text: string;
  icon: React.ElementType;
}

export function ButtonAdd({ icon: Icon, onClick, text }: ButtonAddProps) {
  return (
    <button className="btn add" onClick={onClick}>
      <Icon size={18} />
      <span>{text}</span>
    </button>
  );
}
