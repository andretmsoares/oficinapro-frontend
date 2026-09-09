import { ButtonClose } from "../ButtonClose";
import { ButtonSave } from "../ButtonSave";
import './buttonsForm.style.css';

interface ButtonsFormProps<T = void> {
  onSave: (value: T) => void;
  onClose: () => void;
}

export function ButtonsForm({ onClose, onSave }: ButtonsFormProps) {
  return (
    <div className="buttons-form">
      <ButtonSave onSave={onSave} />
      <ButtonClose onClose={onClose} />
    </div>
  );
}