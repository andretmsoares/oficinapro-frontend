import { ButtonAdd } from "../../Buttons/ButtonAdd";
import './sectionTitle.style.css'

interface SectionTitleProps {
  icon: React.ElementType;
  iconButton: React.ElementType;
  title: string;
  onClick: () => void;
  buttonText: string;
}

export function SectionTitle({
  icon: Icon,
  title,
  onClick,
  buttonText,
  iconButton: Icon2,
}: SectionTitleProps) {
  return (
    <div className="view-os-section-title">
      <div className="view-os-title-with-icon">
        <Icon size={19} />
        <h3>{title}</h3>
      </div>
      <ButtonAdd onClick={onClick} text={buttonText} icon={Icon2}/>
    </div>
  );
}
