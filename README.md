# OficinaPro — Frontend

Interface web do OficinaPro. React 19 + TypeScript + Vite.

> **Estado atual: as telas usam dados mockados.** Não existe camada HTTP — nenhum
> `fetch`, nenhum `axios`. Os dados vêm de `src/mocks/` e o login aceita qualquer
> credencial. Por isso o frontend **roda sem o backend**.
>
> Documentação completa da arquitetura, dos componentes e do plano de integração:
> [`../docs/frontend.md`](../docs/frontend.md).

---

## Como rodar

```bash
npm install
npm run dev
```

http://localhost:5173

Não é necessário subir o backend nem configurar variáveis de ambiente — não há `.env`
neste momento, porque não há chamada de API.

### Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento (Vite) |
| `npm run build` | `tsc -b && vite build` — type-check e bundle em `dist/` |
| `npm run lint` | ESLint |
| `npm run format` | Prettier (escreve) |
| `npm run format:check` | Prettier (só verifica) |

Não há script de teste: o frontend ainda não tem testes.

---

## Stack

| Item | Escolha |
|---|---|
| UI | React 19 |
| Linguagem | TypeScript 6 — ⚠️ `strict` desligado |
| Build | Vite 8 |
| Rotas | react-router-dom 7 |
| Ícones | lucide-react |
| Gráficos | recharts |
| Estilo | CSS puro global, `.style.css` co-localizado |
| Qualidade | ESLint (flat config) + Prettier + husky/lint-staged |

Sem biblioteca de HTTP, de formulário ou de estado global.

---

## Organização

Por **tipo**, com pasta por componente:

```
src/
├── App.tsx        roteamento + estado global
├── index.css      reset + classes de layout e modal
├── mocks/         12 arquivos MOCK_* — fonte de dados atual
├── types/         interfaces por domínio
├── services/      formatters e cálculos (funções puras)
├── pages/         11 páginas
└── components/    componentes reutilizáveis
```

### Os três componentes que sustentam as telas

| Componente | Papel |
|---|---|
| `EntityForm<T>` | modal de formulário orientado a schema, com máscaras e validação |
| `EntityTable<T>` | tabela com busca client-side, colunas customizáveis e ações |
| `EntityViewModal` | modal de leitura |

O `EntityForm` mantém **dois estados paralelos**: `rawValues` (valor canônico — dígitos
puros, dinheiro em **centavos como inteiro**, placa normalizada) e `displayValues` (string
mascarada exibida no input). Só o `rawValues` é enviado no `onSubmit`.

Formulários declaram os campos em um `<nome>Fields.ts` separado, com o helper
`defineFields<T>`. API completa em [`../docs/frontend.md`](../docs/frontend.md).

---

## Rotas e papéis

Papéis: `ADMIN`, `GERENTE`, `MECANICO` — os mesmos do backend
(`src/types/usuario/role.ts`).

| Grupo | Rotas |
|---|---|
| MECANICO + GERENTE | `/dashboard`, `/clientes`, `/veiculos`, `/ordens-servico`, `/mecanicos`, `/pecas`, `/pagamentos` |
| GERENTE | `/usuarios`, `/unidades` |
| ADMIN | `/admin/oficinas`, `/admin/usuarios` |

O guard é o `RequireRole` em `App.tsx`; papel sem acesso é redirecionado para a home do
seu perfil.

> Três dessas telas — Pagamentos, Mecânicos e Clientes — estão liberadas ao MECANICO no
> frontend, mas o backend não libera. Vão retornar `403` ao integrar. Ver
> [`../docs/permissions.md`](../docs/permissions.md).

---

## Antes de integrar com a API

Ordem recomendada, detalhada em [`../docs/frontend.md`](../docs/frontend.md) §9:

1. ligar `strict` no TypeScript (antes de escrever código novo);
2. criar `src/api/client.ts` com token, tratamento de erro e **conversão de dinheiro**
   (centavos ↔ decimal);
3. login real (o `LoginForm` hoje é estático);
4. contexto de autenticação no lugar do `useState` em `App.tsx`;
5. alinhar as rotas à matriz de permissões;
6. substituir um mock por vez.

---

## Contribuindo

1. Componente novo → pasta com `index.tsx` + `<nome>.style.css`.
2. Formulário novo → schema em `<nome>Fields.ts`, nunca inline.
3. Máscara nova → par `format`/`unformat` em `services/formatters.ts`.
4. Tipo novo → `src/types/<dominio>/`, espelhando o DTO do backend.
5. `npm run lint` e `npm run format` antes de commitar.

O hook `pre-commit` (na raiz do repositório) roda `lint-staged` e `npm run build` deste
pacote — um erro de type-check bloqueia o commit.

---

## Documentação relacionada

| Documento | Conteúdo |
|---|---|
| [`../docs/frontend.md`](../docs/frontend.md) | arquitetura, API dos componentes, plano de integração |
| [`../docs/permissions.md`](../docs/permissions.md) | matriz papel × endpoint |
| [`../docs/api.md`](../docs/api.md) | contrato de erro, autenticação, paginação |
| [`../docs/business-rules.md`](../docs/business-rules.md) | regras de OS, desconto e pagamento |
| [`../README.md`](../README.md) | visão geral do projeto |
