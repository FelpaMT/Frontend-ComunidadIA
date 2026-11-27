describe("Directorio de Educadores, Perfiles, Edición y Suscripciones", () => {
  const educatorsPage1 = Array.from({ length: 9 }, (_, i) => ({
    id: i + 2,
    nick_name: `docente_${i + 2}`,
    bio: `Bio docente ${i + 2}`,
    institution: "Universidad Distrital",
    specialty: "IA Educativa",
    avatar: "",
    followers_count: i + 1,
    following_count: 1,
    followed_by_me: i === 0,
    user: { id: i + 2, name: `Profesora ${i + 2}`, email: `p${i + 2}@edu.co`, role: "EDUCATOR" },
  }));

  beforeEach(() => {
    cy.mockAuthenticatedSession();
  });

  it("lista, busca y pagina educadores y permite seguir / dejar de seguir", () => {
    cy.intercept("GET", "**/api/educator?*", (req) => {
      if (String(req.query.offset) === "9") {
        req.alias = "getEducatorsPage2";
        req.reply({
          statusCode: 200,
          body: [
            {
              id: 20,
              nick_name: "profe_pagina2",
              institution: "ETITC",
              specialty: "Robótica",
              followers_count: 4,
              followed_by_me: false,
              user: { id: 20, name: "Docente Página 2" },
            },
          ],
        });
      } else {
        req.alias = "getEducators";
        req.reply({ statusCode: 200, body: educatorsPage1 });
      }
    });

    let mariaFollowed = false;
    cy.intercept("GET", "**/api/educator/search*", (req) => {
      req.reply({
        statusCode: 200,
        body: [
          {
            id: 50,
            nick_name: "maria_prompts",
            institution: "ETITC",
            specialty: "Diseño Instruccional",
            followers_count: mariaFollowed ? 13 : 12,
            followed_by_me: mariaFollowed,
            user: { id: 50, name: "María Fernanda" },
          },
        ],
      });
    }).as("searchEducators");

    cy.intercept("POST", "**/api/subscription/follow/50", (req) => {
      mariaFollowed = true;
      req.reply({ statusCode: 201, body: { detail: "Siguiendo" } });
    }).as("followUser");
    cy.intercept("POST", "**/api/subscription/unfollow/50", (req) => {
      mariaFollowed = false;
      req.reply({ statusCode: 200, body: { detail: "Dejado de seguir" } });
    }).as("unfollowUser");

    cy.visit("/users");
    cy.wait("@getEducators");
    cy.contains("Profesora 2").should("be.visible");
    // Esperar a que pase el debounce inicial (400ms) para evitar reset de página al navegar rápido
    cy.wait(450);

    cy.contains("button", "Siguiente").click();
    cy.wait("@getEducatorsPage2");
    cy.contains("Docente Página 2").should("be.visible");

    cy.get('input[placeholder*="Buscar educador"]').type("maria");
    cy.wait("@searchEducators");
    cy.contains("María Fernanda").should("be.visible");

    cy.contains("button", "Seguir").click();
    cy.wait("@followUser");
    cy.contains("button", "Siguiendo").should("be.visible").click();
    cy.wait("@unfollowUser");
    cy.contains("button", "Seguir").should("be.visible");
  });

  it("visualiza perfil público con pestañas y edita el perfil propio con previsualización de avatar", () => {
    cy.intercept("GET", "**/api/educators/50", {
      statusCode: 200,
      body: {
        id: 50,
        nick_name: "maria_prompts",
        bio: "Especialista en prompts.",
        institution: "ETITC",
        specialty: "IA",
        followers_count: 1,
        following_count: 1,
        followed_by_me: false,
        user: { id: 50, name: "María Fernanda" },
        publications: [],
      },
    }).as("getPublicEdu");

    cy.intercept("GET", "**/api/subscription/50/followers*", {
      statusCode: 200,
      body: [{ id: 1, nick_name: "docente_demo", user: { id: 1, name: "Docente Demo" } }],
    }).as("getEduFollowers");

    cy.visit("/users/50");
    cy.wait("@getPublicEdu");
    cy.contains("h1", "María Fernanda").should("be.visible");
    cy.contains("button", "Seguidores (1)").click();
    cy.wait("@getEduFollowers");
    cy.contains("Docente Demo").should("be.visible");

    // Perfil propio y edición
    cy.intercept("PUT", "**/api/educator/me/update", {
      statusCode: 200,
      body: { id: 1, nick_name: "docente_demo", bio: "Nueva biografía actualizada." },
    }).as("updateProfile");

    cy.visit("/profile");
    cy.contains("button", "Editar Perfil").click();
    cy.location("pathname").should("eq", "/edit-profile");

    cy.get('input[name="avatar"]').type("https://www.gstatic.com/webp/gallery/1.jpg");
    cy.get('img[alt="Previsualización Avatar"]').should("have.attr", "src", "https://www.gstatic.com/webp/gallery/1.jpg");
    cy.get('textarea[name="bio"]').clear().type("Nueva biografía actualizada.");
    cy.get('button[type="submit"]').click();
    cy.wait("@updateProfile");
    cy.contains("¡Perfil actualizado exitosamente!").should("be.visible");
  });

  it("muestra listas de seguidores y seguidos en /subscriptions", () => {
    cy.visit("/subscriptions");
    cy.wait(["@getMyFollowers", "@getMyFollowing"]);
    cy.contains("Me siguen (1)").should("be.visible");
    cy.contains("carlos_ia").should("be.visible");
    cy.contains("Siguiendo (1)").should("be.visible");
    cy.contains("profe_ana").should("be.visible");
  });
});
