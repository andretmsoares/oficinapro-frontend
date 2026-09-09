import "./viewSection.style.css";
import { SectionTitle } from "../SectionTitle";

interface ViewSectionProps {
  icon: React.ElementType;
  title: string;
  onClick: () => void;
  buttonText: string;
  iconButton: React.ElementType;
  children: React.ReactNode;
}

export function ViewSection({
  icon: Icon,
  title,
  onClick,
  buttonText,
  iconButton: ButtonIcon,
  children,
}: ViewSectionProps) {
  return (
    <section className="view-os-section">
      <SectionTitle icon={Icon} title={title} onClick={onClick} buttonText={buttonText} iconButton={ButtonIcon}/>

      {children}
    </section>
  );
}