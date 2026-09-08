import './buttonClose.style.css'
import '../btn.style.css'

export function ButtonClose({ onClose }: { onClose: () => void }) {
    return (
        <button className="btn close" onClick={onClose}>
            Fechar
        </button>
    )
}