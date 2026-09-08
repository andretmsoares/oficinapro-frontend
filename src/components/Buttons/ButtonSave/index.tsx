import './buttonSave.style.css'
import '../btn.style.css'

export function ButtonSave({ onSave }: { onSave: () => void }) {
    return (
        <button className="btn save" onClick={onSave}> 
        Salvar 
        </button>
    )
}