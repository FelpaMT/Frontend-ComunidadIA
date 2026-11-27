describe("Navegación, Home, Paneles Laterales y Cambio de Tema", () => {
  beforeEach(() => {
    cy.mockAuthenticatedSession();
  });

  it("carga Home con feed de seguidos y paneles laterales Siguiendo y Mis publicaciones", () => {
    cy.visit("/home");
    cy.wait(["@getMe", "@getFeed", "@getMyFollowing", "@getMyPublications"]);

    cy.contains("h1", "Hola, docente_demo").should("be.visible");
    cy.contains("Estrategias éticas de Prompts en Aula").should("be.visible");
    cy.contains("h3", "Siguiendo").parent().contains("profe_ana").should("be.visible");
    cy.contains("h3", "Mis publicaciones").parent().contains("Rúbricas formativas con IA").should("be.visible");
  });

  it("muestra estado vacío y manejo controlado de error en Home", () => {
    cy.intercept("GET", "**/api/publication/feed*", { statusCode: 200, body: [] }).as("emptyFeed");
    cy.visit("/home");
    cy.wait("@emptyFeed");
    cy.contains("Aún no hay publicaciones de docentes que sigues.").should("be.visible");

    cy.intercept("GET", "**/api/publication/feed*", { statusCode: 500, body: { detail: "Server Error" } }).as("errorFeed");
    cy.visit("/home");
    cy.wait("@errorFeed");
    cy.contains("Error cargando publicaciones de tus suscripciones.").should("be.visible");
  });

  it("permite navegar entre secciones desde Navbar y alternar tema Claro / Oscuro / Sistema", () => {
    cy.intercept("GET", "**/api/publication/categories", { statusCode: 200, body: [] });
    cy.intercept("GET", "**/api/publication?*", { statusCode: 200, body: [] });
    cy.intercept("GET", "**/api/educator?*", { statusCode: 200, body: [] });

    cy.visit("/home");
    cy.get('nav a').contains("Publicaciones").click();
    cy.location("pathname").should("eq", "/publications");

    cy.get('nav a').contains("Usuarios").click();
    cy.location("pathname").should("eq", "/users");

    cy.get('header button').contains("ComunidadIA").click();
    cy.location("pathname").should("eq", "/home");

    cy.get('button[aria-label="Cambiar tema"]').click();
    cy.contains("button", "Oscuro").click();
    cy.get("html").should("have.class", "dark");

    cy.get('button[aria-label="Cambiar tema"]').click();
    cy.contains("button", "Claro").click();
    cy.get("html").should("not.have.class", "dark");
  });
});
