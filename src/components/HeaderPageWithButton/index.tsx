import { HeaderPage } from "../HeaderPage";
import "./headerPageWithButton.style.css";
import { ButtonAdd } from "../Buttons/ButtonAdd";

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
        <HeaderPage title={title} subtitle={subtitle} />

        <ButtonAdd onClick={onButtonClick} text={buttonText} />
    </div>
  );
}