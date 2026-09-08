import { ButtonClose } from '../Buttons/ButtonClose';
import './clientForm.style.css';
import '../../App.css';
import { InputClientForm } from './InputClientForm';

export function ClientForm({ onClose }: { onClose: () => void }) {
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
            <button type="submit">Salvar</button>
        </form>
        <ButtonClose onClose={onClose} />
      </div>
    </div>
  );
}