import { type CreateClienteProps } from "../../../types/cliente/createCliente";

export function InputClientForm(props: CreateClienteProps) {
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