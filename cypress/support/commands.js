// Custom Cypress helpers and API stubs for deterministic E2E testing of ComunidadIA.

Cypress.Commands.add("mockAuthenticatedSession", (overrides = {}) => {
  const meEducator = overrides.meEducator || {
    id: 1,
    nick_name: "docente_demo",
    bio: "Investigador en pedagogía digital e inteligencia artificial.",
    institution: "Universidad Distrital FJC",
    specialty: "Didáctica e IA Generativa",
    avatar: "",
    website: "https://comunidadia.pedagogiavirtual.com",
    linkedin_url: "https://linkedin.com/in/docente-demo",
    followers_count: 2,
    following_count: 1,
    user: {
      id: 1,
      name: "Docente Demo",
      email: "docente@comunidadia.edu",
      role: "EDUCATOR",
    },
    publications: overrides.myPublications || [
      {
        id: 101,
        title: "Rúbricas formativas con IA",
        publication_type: "ARTICLE",
        created_at: "2026-10-20T14:30:00Z",
        comments_count: 1,
        images_count: 0,
        category: { id: 5, name: "Evaluación con IA", slug: "evaluacion-ia" },
        writer: { id: 1, nick_name: "docente_demo", avatar: "", user: { id: 1, name: "Docente Demo" } },
      },
    ],
  };

  cy.intercept("POST", "**/api/auth/refresh", {
    statusCode: 200,
    body: { new_access_token: "mock-access-token-123" },
  }).as("refreshToken");

  cy.intercept("GET", "**/api/educator/me", {
    statusCode: 200,
    body: meEducator,
  }).as("getMe");

  cy.intercept("GET", "**/api/subscription/me/following*", {
    statusCode: 200,
    body: overrides.following || [
      {
        id: 2,
        nick_name: "profe_ana",
        user: { id: 2, name: "Ana Gómez", email: "ana@comunidadia.edu" },
      },
    ],
  }).as("getMyFollowing");

  cy.intercept("GET", "**/api/subscription/me/followers*", {
    statusCode: 200,
    body: overrides.followers || [
      {
        id: 3,
        nick_name: "carlos_ia",
        user: { id: 3, name: "Carlos Ruiz", email: "carlos@comunidadia.edu" },
      },
    ],
  }).as("getMyFollowers");

  cy.intercept("GET", "**/api/publication/me*", {
    statusCode: 200,
    body: meEducator.publications || [],
  }).as("getMyPublications");

  cy.intercept("GET", "**/api/publication/feed*", {
    statusCode: 200,
    body: overrides.feed || [
      {
        id: 201,
        title: "Estrategias éticas de Prompts en Aula",
        publication_type: "ARTICLE",
        created_at: "2026-10-24T10:00:00Z",
        comments_count: 2,
        images_count: 1,
        category: { id: 2, name: "Prompts y Diseño Instruccional", slug: "prompts-educativos" },
        writer: { id: 2, nick_name: "profe_ana", avatar: "", user: { id: 2, name: "Ana Gómez" } },
      },
    ],
  }).as("getFeed");
});

Cypress.Commands.add("mockAnonymousSession", () => {
  cy.intercept("POST", "**/api/auth/refresh", {
    statusCode: 401,
    body: { detail: "No refresh token." },
  }).as("refreshUnauthorized");
});
