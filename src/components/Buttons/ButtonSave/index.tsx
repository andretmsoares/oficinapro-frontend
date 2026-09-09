import './buttonSave.style.css'
import '../btn.style.css'

export function ButtonSave({ onSave }: { onSave: (value: T) => void }) {
    return (
        <button className="btn save" onClick={onSave}> 
        Salvar 
        </button>
    )
}