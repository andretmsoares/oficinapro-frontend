import { defineFields } from "../../components/EntityForm/types";
import type { Role } from "../../types/usuario/role";
import { buscarOficinasAutocomplete } from "../../services/oficina/oficinaService";

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
  isAdmin: boolean,
  roleOptions: { label: string; value: string }[],
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
      label: "Cargo",
      placeholder: "Escolha o cargo do usuário",
      type: "select",
      required: true,
      options: roleOptions,
    },

    ...(isAdmin
      ? [
          {
            name: "oficinaId" as const,
            label: "Oficina",
            placeholder: "Digite nome ou CNPJ...",
            type: "entity-select" as const,
            required: true,
            hidden: (formData: Partial<UsuarioFormData>) =>
              formData.role === "ADMIN",
            fetchOptions: buscarOficinasAutocomplete,
            minChars: 2,
            debounceMs: 400,
            noResultsText: "Nenhuma oficina encontrada",
          },
        ]
      : []),
  ]);
}
