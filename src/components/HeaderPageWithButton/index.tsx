import { Plus } from "lucide-react";
import { HeaderPage } from "../HeaderPage";
import "./headerPageWithButton.style.css";

interface HeaderPageWithButtonProps {
  title: string;
  subtitle: string;
  buttonText: string;
  onButtonClick: () => void;
}

export function HeaderPageWithButton({
  title,
  subtitle,
  buttonText,
  onButtonClick,
}: HeaderPageWithButtonProps) {
  return (
    <div className="page-header-with-button">
      <div>
        <HeaderPage title={title} subtitle={subtitle} />
      </div>

      <button className="add-button" type="button" onClick={onButtonClick}>
        <Plus size={18} />
        <span>{buttonText}</span>
      </button>
    </div>
  );
}