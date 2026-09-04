import './buttonAdd.style.css';

export function ButtonAdd(props: { onClick: () => void; text: string }) {
  return (
    <button className="btn-add" onClick={props.onClick}>
      {props.text}
    </button>
  );
}