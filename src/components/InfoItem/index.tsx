import './infoItem.style.css'

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

export function InfoItem({ icon: Icon, label, value }: InfoItemProps) {
  return (
    <div className="view-os-info-item">
      <div className="view-os-info-icon">
        <Icon size={17} />
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
