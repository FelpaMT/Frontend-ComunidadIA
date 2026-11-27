describe("Asistente Virtual Tutor Pedagógico IA e Inyección de Contexto RAG", () => {
  beforeEach(() => {
    cy.mockAuthenticatedSession();
  });

  it("permite conversar en modo general desde Home y limpiar historial", () => {
    cy.intercept("POST", "**/api/ai/chat/", {
      statusCode: 200,
      body: {
        response: "### Sugerencia Didáctica\nUsa rúbricas analíticas claras con tus estudiantes.",
        context_used: false,
      },
    }).as("chatGeneral");

    cy.visit("/home");
    cy.get('button[title="Abrir Asistente Tutor IA"]').click();
    cy.contains("h3", "Tutor Pedagógico IA").should("be.visible");

    cy.get('input[placeholder*="Haz una consulta didáctica"]').type("¿Cómo diseñar rúbricas con IA?");
    cy.get('form button[type="submit"]').last().click();

    cy.wait("@chatGeneral").its("request.body").should("deep.include", {
      message: "¿Cómo diseñar rúbricas con IA?",
      publication_id: null,
    });
    cy.contains("Sugerencia Didáctica").should("be.visible");
    cy.contains("Contexto pedagógico inyectado").should("not.exist");

    cy.get('button[title="Limpiar conversación"]').click();
    cy.contains("¡Historial reiniciado!").should("be.visible");
  });

  it("detecta publicación activa en /publications/:id, inyecta contexto RAG y permite alternarlo", () => {
    cy.intercept("GET", "**/api/publications/101", {
      statusCode: 200,
      body: {
        id: 101,
        title: "Evaluación Formativa Asistida",
        publication_type: "ARTICLE",
        created_at: "2026-10-20T14:30:00Z",
        writer: { id: 1, nick_name: "docente_demo", user: { id: 1, name: "Docente Demo" } },
        content: "<p>Contenido sobre evaluación formativa.</p>",
        comments: [],
        images: [],
      },
    }).as("getPubContext");

    cy.intercept("POST", "**/api/ai/chat/", (req) => {
      const hasPub = Boolean(req.body.publication_id);
      req.reply({
        statusCode: 200,
        body: {
          response: hasPub
            ? "Basado en el artículo **Evaluación Formativa Asistida**, te recomiendo..."
            : "Respuesta general sin contexto.",
          context_used: hasPub,
        },
      });
    }).as("chatContext");

    cy.visit("/publications/101");
    cy.wait("@getPubContext");

    cy.get('button[title="Abrir Asistente Tutor IA"]').click();
    cy.contains("Contexto:").should("be.visible");
    cy.contains("Evaluación Formativa Asistida").should("be.visible");
    cy.contains("button", "Activo").should("be.visible");

    cy.get('input[placeholder*="Haz una consulta didáctica"]').type("Resume este artículo");
    cy.get('form button[type="submit"]').last().click();
    cy.wait("@chatContext").its("request.body").should("deep.include", {
      publication_id: 101,
    });
    cy.contains("Contexto pedagógico inyectado").should("be.visible");

    // Desactivar contexto manualmente y enviar segunda consulta
    cy.contains("button", "Activo").click();
    cy.contains("button", "Inactivo").should("be.visible");
    cy.get('input[placeholder*="Haz una consulta didáctica"]').type("Dame un consejo general");
    cy.get('form button[type="submit"]').last().click();
    cy.wait("@chatContext").its("request.body").should("deep.include", {
      publication_id: null,
    });
    cy.contains("Respuesta general sin contexto.").should("be.visible");
  });

  it("muestra mensaje controlado cuando el servicio de IA devuelve error", () => {
    cy.intercept("POST", "**/api/ai/chat/", {
      statusCode: 500,
      body: { error: "Cuota de Gemini excedida temporalmente." },
    }).as("chatError");

    cy.visit("/home");
    cy.get('button[title="Abrir Asistente Tutor IA"]').click();
    cy.get('input[placeholder*="Haz una consulta didáctica"]').type("Hola Tutor");
    cy.get('form button[type="submit"]').last().click();
    cy.wait("@chatError");
    cy.contains("Cuota de Gemini excedida temporalmente.").should("be.visible");
  });
});
