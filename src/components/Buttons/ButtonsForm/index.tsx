import { ButtonClose } from "../ButtonClose";
import { ButtonSave } from "../ButtonSave";
import './buttonsForm.style.css';

export function ButtonsForm({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  return (
    <div className="buttons-form">
      <ButtonSave onSave={onSave} />
      <ButtonClose onClose={onClose} />
    </div>
  );
}