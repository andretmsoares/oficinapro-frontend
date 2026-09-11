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
    { name: "nome", label: "Nome", type: "text", required: true },
    { name: "documento", label: "CPF", type: "document", required: true },
    { name: "telefone", label: "Telefone", type: "phone", required: true },
    { name: "username", label: "Username", type: "text", required: true },
    { name: "password", label: "Senha", type: "password", required: true },
    {
      name: "role",
      label: "Role",
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
      type: "select",
      required: true,
      hidden: (formData) => formData.role === "ADMIN",
      options: oficinaOptions,
    },
  ]);
}
