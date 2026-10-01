# OficinaPro — Frontend

Interface web do OficinaPro. React 19 + TypeScript + Vite.

Este repositório contém **só o frontend**. A API é o projeto independente
[`oficinapro-backend`](https://github.com/andretmsoares/oficinapro-backend) (Spring Boot, porta 8080).

> O frontend consome a API do backend por `fetch` com JWT (`src/services/api.ts` e demais
> `src/services/*Service.ts`). **Precisa do backend no ar** — veja abaixo.
>
> Arquitetura e componentes: [`docs/frontend.md`](./docs/frontend.md) (parte dele ainda
> descreve a fase em que as telas eram mockadas, como indicado no aviso do próprio arquivo).

---

## Como rodar

```bash
npm install
cp .env-example .env   # define VITE_API_URL (backend, ex.: http://localhost:8080/api)
npm run dev
```

http://localhost:5173

É necessário ter o **backend no ar** (suba-o conforme o README de
[`oficinapro-backend`](https://github.com/andretmsoares/oficinapro-backend)) e a variável `VITE_API_URL` definida no `.env` (copie de
`.env-example`); sem ela as requisições vão para `undefined/...`. O backend só aceita a
origem configurada em `OFICINAPRO_CORS_ALLOWED_ORIGINS` (`http://localhost:3000` por padrão):
se o Vite subir em `5173`, ajuste essa variável no `.env` do backend.

### Docker

```bash
# desenvolvimento (Vite em http://localhost:3000, hot reload)
docker compose -f compose.dev.yml up

# imagem de produção (nginx); VITE_API_URL é embutido no BUILD, não lido em runtime
docker build --build-arg VITE_API_URL=http://localhost:8080/api -t oficinapro-frontend .
```

`compose.prod.yml` sobe a imagem publicada (`$DOCKER_USERNAME/oficinapro-frontend:latest`).

### Scripts

| Comando                         | O que faz                                               |
| ------------------------------- | ------------------------------------------------------- |
| `npm run dev`                   | servidor de desenvolvimento (Vite)                      |
| `npm run build`                 | `tsc -b && vite build` — type-check e bundle em `dist/` |
| `npm run lint`                  | ESLint                                                  |
| `npm run format`                | Prettier (escreve)                                      |
| `npm run format:check`          | Prettier (só verifica)                                  |
| `npm test` / `npm run test:run` | Vitest (watch / uma execução)                           |
| `npm run test:coverage`         | Vitest com cobertura                                    |
| `npm run test:e2e`              | Playwright (fluxos críticos em `tests/e2e`)             |

---

## Stack

| Item      | Escolha                                               |
| --------- | ----------------------------------------------------- |
| UI        | React 19                                              |
| Linguagem | TypeScript 6 — ⚠️ `strict` desligado                  |
| Build     | Vite 8                                                |
| Rotas     | react-router-dom 7                                    |
| Ícones    | lucide-react                                          |
| Gráficos  | recharts                                              |
| Estilo    | CSS puro global, `.style.css` co-localizado           |
| HTTP      | `fetch` nativo (`src/services/api.ts`)                |
| Testes    | Vitest + MSW (unitários/integração), Playwright (e2e) |
| Qualidade | ESLint (flat config) + Prettier + husky/lint-staged   |

Sem biblioteca de formulário ou de estado global.

---

## Organização

Por **tipo**, com pasta por componente:

```
src/
├── App.tsx        roteamento + estado global
├── index.css      reset + classes de layout e modal
├── types/         interfaces por domínio
├── services/      clientes da API (`api.ts`, `*Service.ts`)
├── hooks/         `useServerSearch`
├── utils/         formatters e cálculos (funções puras)
├── pages/         11 páginas
└── components/    componentes reutilizáveis
tests/             unit/integração (Vitest + MSW) e e2e (Playwright)
```

### Os três componentes que sustentam as telas

| Componente        | Papel                                                            |
| ----------------- | ---------------------------------------------------------------- |
| `EntityForm<T>`   | modal de formulário orientado a schema, com máscaras e validação |
| `EntityTable<T>`  | tabela com busca client-side, colunas customizáveis e ações      |
| `EntityViewModal` | modal de leitura                                                 |

O `EntityForm` mantém **dois estados paralelos**: `rawValues` (valor canônico — dígitos
puros, dinheiro em **centavos como inteiro**, placa normalizada) e `displayValues` (string
mascarada exibida no input). Só o `rawValues` é enviado no `onSubmit`.

Formulários declaram os campos em um `<nome>Fields.ts` separado, com o helper
`defineFields<T>`. API completa em [`docs/frontend.md`](./docs/frontend.md).

---

## Rotas e papéis

Papéis: `ADMIN`, `GERENTE`, `MECANICO` — os mesmos do backend
(`src/types/usuario/role.ts`).

| Grupo              | Rotas                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| MECANICO + GERENTE | `/dashboard`, `/clientes`, `/veiculos`, `/ordens-servico`, `/mecanicos`, `/pecas`, `/pagamentos` |
| GERENTE            | `/usuarios`, `/unidades`                                                                         |
| ADMIN              | `/admin/oficinas`, `/admin/usuarios`                                                             |

O guard é o `RequireRole` em `App.tsx`; papel sem acesso é redirecionado para a home do
seu perfil.

> A autorização real é a do backend; o guard daqui é só UX. Se uma tela liberada no frontend
> retornar `403`, a matriz do backend é a referência: [`permissions.md`](https://github.com/andretmsoares/oficinapro-backend/blob/develop/docs/permissions.md).

---

## Integração com o backend

- `VITE_API_URL` é a base de todas as chamadas (ver `src/services/api.ts`).
- Contrato de erro, autenticação e paginação: [`api.md`](https://github.com/andretmsoares/oficinapro-backend/blob/develop/docs/api.md).
- Dinheiro trafega em **centavos** de ponta a ponta.
- Mudou um DTO, um papel ou uma permissão no backend? Atualize `src/types/` e o `RequireRole`
  neste repositório — os dois evoluem separadamente.

---

## Contribuindo

1. Componente novo → pasta com `index.tsx` + `<nome>.style.css`.
2. Formulário novo → schema em `<nome>Fields.ts`, nunca inline.
3. Máscara nova → par `format`/`unformat` em `services/formatters.ts`.
4. Tipo novo → `src/types/<dominio>/`, espelhando o DTO do backend.
5. `npm run lint` e `npm run format` antes de commitar.

O hook `pre-commit` (husky, em `.husky/`) roda `lint-staged` e `npm run build` — um erro de
type-check bloqueia o commit.

---

## Documentação relacionada

| Documento                                                                                                      | Conteúdo                                            |
| -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| [`docs/frontend.md`](./docs/frontend.md)                                                                       | arquitetura e API dos componentes                   |
| [`permissions.md`](https://github.com/andretmsoares/oficinapro-backend/blob/develop/docs/permissions.md)       | matriz papel × endpoint (backend)                   |
| [`api.md`](https://github.com/andretmsoares/oficinapro-backend/blob/develop/docs/api.md)                       | contrato de erro, autenticação, paginação (backend) |
| [`business-rules.md`](https://github.com/andretmsoares/oficinapro-backend/blob/develop/docs/business-rules.md) | regras de OS, desconto e pagamento (backend)        |
| [`README` do backend](https://github.com/andretmsoares/oficinapro-backend#readme)                              | visão geral do projeto e como subir a API           |
