import "./createEntity.style.css";

export function CreateEntityInput(props: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
  readOnly?: boolean;
}) {
  return (
    <div className="input-create-entity">
      <label>{props.label}</label>
      <input
        type={props.type || "text"}
        placeholder={props.placeholder}
        value={props.value}
        disabled={props.disabled}
        readOnly={props.readOnly}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </div>
  );
}
