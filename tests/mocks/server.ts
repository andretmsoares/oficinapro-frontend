import { setupServer } from "msw/node";

// Sem handlers globais: cada teste declara as rotas de que precisa com server.use().
export const server = setupServer();
