import { defineFields } from "../../components/EntityForm/types";
import type { Role } from "../../types/usuario/role";

export type UsuarioFormData = {
  nome: string;
  documento: string;
  telefone: string;
  username: string;
  password: string;
  role: Role;
  oficinaId?: number; // ausente quando role === "ADMIN"
};

export function createUsuarioFields(
  oficinaOptions: { label: string; value: string }[],
) {
  return defineFields<UsuarioFormData>([
    {
      name: "nome",
      label: "Nome",
      placeholder: "Digite o nome do usuário",
      type: "text",
      required: true,
    },
    {
      name: "documento",
      label: "CPF",
      placeholder: "Digite o CPF do usuário",
      type: "document",
      required: true,
    },
    {
      name: "telefone",
      label: "Telefone",
      placeholder: "Digite o telefone do usuário",
      type: "phone",
      required: true,
    },
    {
      name: "username",
      label: "Username",
      placeholder: "Digite o username do usuário",
      type: "text",
      required: true,
    },
    {
      name: "password",
      label: "Senha",
      placeholder: "Digite a senha do usuário",
      type: "password",
      required: true,
    },
    {
      name: "role",
      label: "Role",
      placeholder: "Escolha o cargo do usuário",
      type: "select",
      required: true,
      options: [
        { label: "Administrador", value: "ADMIN" },
        { label: "Gerente", value: "GERENTE" },
        { label: "Mecânico", value: "MECANICO" },
      ],
    },
    {
      name: "oficinaId",
      label: "Oficina",
      placeholder: "Digite o id da oficina do usuário",
      type: "select",
      required: true,
      hidden: (formData) => formData.role === "ADMIN",
      options: oficinaOptions,
    },
  ]);
}
