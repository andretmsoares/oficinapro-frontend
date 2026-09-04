import './clientForm.style.css';

export function ClientForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Formulário de Cliente</h2>
        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}