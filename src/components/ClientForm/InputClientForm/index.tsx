interface InputClientFormProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function InputClientForm(props: InputClientFormProps) {
    return (
        <div className="input-client-form">
            <label>{props.label}</label>
            <input
                type="text"
                value={props.value}
                onChange={(e) => props.onChange(e.target.value)}
            />
        </div>
    )
} 