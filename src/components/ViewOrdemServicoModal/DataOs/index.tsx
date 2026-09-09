import { Building2, Calendar, Car, HardHat, MapPin, Phone, User } from 'lucide-react'
import { formatDate, formatPhone, formatStatus } from '../../../services/formatters'
import { InfoItem } from '../../InfoItem'
import './dataOs.style.css'
import type { OrdemDeServico } from '../../../types/ordemDeServico/ordemDeServico';

interface DataOSProps {
  ordemServico: OrdemDeServico;
}

export function DataOS({ordemServico}: DataOSProps) {
    return (
        <section className="view-os-section">
          <div className="view-os-section-title">
            <h3>Dados da Ordem de Serviço</h3>

            <span
              className={`view-os-status status-${ordemServico.status.toLowerCase()}`}
            >
              {formatStatus(ordemServico.status)}
            </span>
          </div>

          <div className="view-os-info-grid">
            <InfoItem
              icon={Building2}
              label="Oficina"
              value={`Oficina #${ordemServico.oficinaId}`}
            />

            <InfoItem
              icon={MapPin}
              label="Unidade"
              value={
                ordemServico.unidadeId
                  ? `Unidade #${ordemServico.unidadeId}`
                  : "Não informado"
              }
            />
            <InfoItem icon={Phone} label="Telefone" value={formatPhone("83988888888")} />

            <InfoItem
              icon={User}
              label="Cliente"
              value={
                ordemServico.nomeCliente || `Cliente #${ordemServico.clienteId}`
              }
            />

            <InfoItem
              icon={Car}
              label="Veículo"
              value={
                ordemServico.placaVeiculo ||
                `Veículo #${ordemServico.veiculoId}`
              }
            />

            <InfoItem
              icon={HardHat}
              label="Mecânico responsável"
              value={`Mecânico #${ordemServico.mecanicoId}`}
            />

            <InfoItem
              icon={Calendar}
              label="Data de abertura"
              value={formatDate(ordemServico.dataAbertura)}
            />

            <InfoItem
              icon={Calendar}
              label="Data de fechamento"
              value={formatDate(ordemServico.dataFechamento)}
            />
          </div>

          {ordemServico.obs && (
            <div className="view-os-observation">
              <span>Observações</span>
              <p>{ordemServico.obs}</p>
            </div>
          )}
        </section>
    )
}