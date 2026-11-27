describe("Publicaciones, Editor Enriquecido Quill, Sanitización Anti-XSS y Comentarios", () => {
  const categories = [
    { id: 1, name: "IA Generativa en el Aula", slug: "ia-generativa" },
    { id: 5, name: "Evaluación con IA", slug: "evaluacion-ia" },
  ];

  const feedList = [
    {
      id: 101,
      title: "Rúbricas formativas con IA",
      publication_type: "ARTICLE",
      created_at: "2026-10-20T14:30:00Z",
      comments_count: 1,
      images_count: 1,
      category: categories[1],
      writer: { id: 1, nick_name: "docente_demo", user: { id: 1, name: "Docente Demo" } },
    },
    {
      id: 102,
      title: "Debate sobre ética estudiantil",
      publication_type: "FORUM",
      created_at: "2026-10-22T12:00:00Z",
      comments_count: 0,
      images_count: 0,
      category: categories[0],
      writer: { id: 2, nick_name: "profe_ana", user: { id: 2, name: "Ana Gómez" } },
    },
  ];

  beforeEach(() => {
    cy.mockAuthenticatedSession();
    cy.intercept("GET", "**/api/publication/categories", { statusCode: 200, body: categories }).as("getCategories");
  });

  it("filtra publicaciones por tipo, categoría y búsqueda", () => {
    cy.intercept("GET", "**/api/publication?*", (req) => {
      if (req.query.publication_type === "FORUM") {
        req.reply({ statusCode: 200, body: [feedList[1]] });
      } else {
        req.reply({ statusCode: 200, body: feedList });
      }
    }).as("getPublications");

    cy.intercept("GET", "**/api/publication/search*", {
      statusCode: 200,
      body: [feedList[0]],
    }).as("searchPublications");

    cy.visit("/publications");
    cy.wait(["@getCategories", "@getPublications"]);
    cy.contains("Rúbricas formativas con IA").should("be.visible");
    cy.contains("Debate sobre ética estudiantil").should("be.visible");

    cy.contains("button", "Foros").click();
    cy.wait("@getPublications");
    cy.contains("Debate sobre ética estudiantil").should("be.visible");

    cy.get('input[placeholder="Buscar título o contenido..."]').type("Rúbricas");
    cy.wait("@searchPublications");
    cy.contains("Rúbricas formativas con IA").should("be.visible");
  });

  it("crea una publicación con Quill e imagen adjunta", () => {
    cy.intercept("POST", "**/api/publication/me/create", {
      statusCode: 201,
      body: {
        id: 555,
        title: "Guía práctica de prompts docentes",
        publication_type: "ARTICLE",
        created_at: "2026-10-26T10:00:00Z",
        category: categories[0],
        writer: { id: 1, nick_name: "docente_demo", user: { id: 1, name: "Docente Demo" } },
      },
    }).as("createPub");

    cy.intercept("POST", "**/api/upload/", {
      statusCode: 201,
      body: { id: 9, absolute_url: "https://www.gstatic.com/webp/gallery/1.jpg", caption: "" },
    }).as("uploadImg");

    cy.intercept("GET", "**/api/publications/555", {
      statusCode: 200,
      body: {
        id: 555,
        title: "Guía práctica de prompts docentes",
        publication_type: "ARTICLE",
        created_at: "2026-10-26T10:00:00Z",
        category: categories[0],
        writer: { id: 1, nick_name: "docente_demo", user: { id: 1, name: "Docente Demo" } },
        content: "<p>Contenido pedagógico validado.</p>",
        comments: [],
        images: [{ id: 9, absolute_url: "https://www.gstatic.com/webp/gallery/1.jpg", caption: "Imagen prueba" }],
      },
    }).as("getCreatedPub");

    cy.visit("/create-publication");
    cy.wait("@getCategories");

    // Validación de formulario vacío
    cy.contains("button", "Publicar Ahora").click();
    cy.get('input[placeholder="Escribe un título claro y conciso..."]').type("Guía práctica de prompts docentes");
    cy.get("form select:not(.ql-header)").select("1");
    cy.get(".ql-editor").click().type("Contenido pedagógico validado.");

    cy.get("#image-upload-input").selectFile(
      {
        contents: Cypress.Buffer.from("fake-png-content"),
        fileName: "esquema.png",
        mimeType: "image/png",
      },
      { force: true }
    );

    cy.contains("button", "Publicar Ahora").click();
    cy.wait("@createPub");
    cy.wait("@uploadImg");
    cy.contains("¡Publicación creada exitosamente!").should("be.visible");
    cy.location("pathname", { timeout: 6000 }).should("eq", "/publications/555");
  });

  it("sanitiza HTML contra ataques XSS en detalle y permite comentar, editar y eliminar", () => {
    cy.intercept("GET", "**/api/publications/101", {
      statusCode: 200,
      body: {
        id: 101,
        title: "Publicación Segura",
        publication_type: "ARTICLE",
        created_at: "2026-10-20T14:30:00Z",
        category: categories[1],
        writer: { id: 1, nick_name: "docente_demo", user: { id: 1, name: "Docente Demo" } },
        content: '<p>Texto pedagógico limpio</p><img src="x" onerror="window.__xssTriggered=true"><script>window.__xssTriggered=true</script>',
        comments: [],
        images: [],
      },
    }).as("getDetail");

    cy.intercept("POST", "**/api/commentary/me/101", {
      statusCode: 201,
      body: {
        id: 88,
        content: "Excelente aporte para evaluar en el aula.",
        created_at: "2026-10-26T12:00:00Z",
        writer: { id: 1, nick_name: "docente_demo", user: { id: 1, name: "Docente Demo" } },
      },
    }).as("addComment");

    cy.intercept("DELETE", "**/api/commentary/me/delete/88", { statusCode: 204 }).as("deleteComment");
    cy.intercept("PUT", "**/api/publication/me/update/101", {
      statusCode: 200,
      body: { id: 101, title: "Publicación Editada" },
    }).as("updatePub");
    cy.intercept("DELETE", "**/api/publication/me/101", { statusCode: 204 }).as("deletePub");

    cy.visit("/publications/101");
    cy.wait("@getDetail");

    cy.contains("Texto pedagógico limpio").should("be.visible");
    cy.get("article script").should("not.exist");
    cy.window().its("__xssTriggered").should("be.undefined");

    // Crear y eliminar comentario
    cy.get('textarea[placeholder="Escribe tu aporte o pregunta al debate..."]').type("Excelente aporte para evaluar en el aula.");
    cy.get('form button[type="submit"]').last().click();
    cy.wait("@addComment");
    cy.contains("Excelente aporte para evaluar en el aula.").should("be.visible");

    cy.on("window:confirm", () => true);
    cy.get('section button[title="Eliminar comentario"], section button').filter(":has(svg)").last().click();
    cy.wait("@deleteComment");
    cy.contains("Excelente aporte para evaluar en el aula.").should("not.exist");

    // Editar publicación
    cy.contains("button", "Editar").click();
    cy.location("pathname").should("eq", "/publications/101/edit");
    cy.get('input[placeholder="Escribe un título claro y conciso..."]').clear().type("Publicación Editada");
    cy.contains("button", "Actualizar Publicación").click();
    cy.wait("@updatePub");
    cy.contains("¡Publicación actualizada exitosamente!").should("be.visible");

    // Eliminar publicación
    cy.visit("/publications/101");
    cy.wait("@getDetail");
    cy.contains("button", "Eliminar").click();
    cy.wait("@deletePub");
    cy.location("pathname").should("eq", "/publications");
  });
});
