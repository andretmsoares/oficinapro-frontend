import './createEntity.style.css';

export function CreateEntityInput(props: {label: string, value: string, onChange: (value: string) => void, type?: string}) {
    return (
        <div className="input-create-entity">
            <input
                type={props.type || "text"}
                placeholder={props.label}
                value={props.value}
                onChange={(e) => props.onChange(e.target.value)}
            />
        </div>
    )
} 