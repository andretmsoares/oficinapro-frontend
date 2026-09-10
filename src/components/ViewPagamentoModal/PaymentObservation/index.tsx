import "./paymentObservation.style.css";

interface PaymentObservationProps {
  observation?: string;
}

export function PaymentObservation({ observation }: PaymentObservationProps) {
  if (!observation) {
    return null;
  }

  return (
    <div className="payment-observation">
      <strong>Observações</strong>
      <p>{observation}</p>
    </div>
  );
}
