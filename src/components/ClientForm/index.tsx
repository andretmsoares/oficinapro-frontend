import './clientForm.style.css';
import '../../App.css';
import { InputClientForm } from './InputClientForm';
import { ButtonsForm } from '../Buttons/ButtonsForm';

export function ClientForm({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Cadastro de Cliente</h2>
        <form>

            <InputClientForm
                label="Nome:"
                value=""
                onChange={() => {}}
            />
            <InputClientForm
                label="CPF/CNPJ:"
                value=""
                onChange={() => {}}
            />
            <InputClientForm
                label="Telefone:"
                value=""
                onChange={() => {}}
            />
        </form>
        <ButtonsForm onClose={onClose} onSave={onSave} />
      </div>
    </div>
  );
}