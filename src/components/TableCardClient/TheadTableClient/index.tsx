import "./theadTableClient.style.css";

export function TheadTableClient(){
  return (
    <thead className="thead-table">
      <tr>
        <th>Código</th>
        <th>Nome</th>
        <th>CPF/CNPJ</th>
        <th>Telefone</th>
        <th>Ordens de Serviço</th>
        <th className="actions-header">Ações</th>
      </tr>
    </thead>
  );
}
