import './headerOs.style.css';

interface HeaderOsProps {
    id: number;
}
export function HeaderOs({id} : HeaderOsProps) {
    return (
        <header className="view-os-header">
          <div>
            <span className="view-os-code">
              OS #{id.toString().padStart(4, "0")}
            </span>

            <h2>Ordem de Serviço</h2>
          </div>
        </header>
    )
}