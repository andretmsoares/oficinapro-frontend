import { Plus } from 'lucide-react';
import './buttonAdd.style.css';

export function ButtonAdd(props: { onClick: () => void; text: string }) {
  return (
    <button className="btn-add" onClick={props.onClick}>
      <Plus size={18} />
      <span>{props.text}</span>
    </button>
  );
}