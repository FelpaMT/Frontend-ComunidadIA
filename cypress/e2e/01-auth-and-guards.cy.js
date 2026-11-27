describe("Autenticación, Verificación, Recuperación y Guardias de Ruta", () => {
  it("redirige / hacia /inicio para visitantes y muestra landing page", () => {
    cy.mockAnonymousSession();
    cy.visit("/");
    cy.location("pathname").should("eq", "/inicio");
    cy.contains("h1", "ComunidadIA").should("be.visible");
    cy.contains("button", "Iniciar sesión").should("be.visible");
    cy.contains("button", "Crear cuenta").should("be.visible");
  });

  it("bloquea rutas protegidas cuando no hay sesión y redirige a /signin", () => {
    cy.mockAnonymousSession();
    cy.visit("/home");
    cy.location("pathname").should("eq", "/signin");
    cy.contains("h2", "Iniciar sesión").should("be.visible");

    cy.visit("/create-publication");
    cy.location("pathname").should("eq", "/signin");
  });

  it("redirige rutas públicas (/signin) hacia /home cuando ya existe sesión activa", () => {
    cy.mockAuthenticatedSession();
    cy.visit("/signin");
    cy.location("pathname").should("eq", "/home");
    cy.contains("Hola, docente_demo").should("be.visible");
  });

  it("permite registro exitoso y maneja errores de correo duplicado", () => {
    cy.mockAnonymousSession();
    cy.intercept("POST", "**/api/auth/signup", (req) => {
      if (req.body.email === "duplicado@comunidadia.edu") {
        req.reply({
          statusCode: 400,
          body: { email: ["Ya existe un usuario con este email."] },
        });
      } else {
        req.reply({
          statusCode: 201,
          body: {
            detail: "Usuario registrado exitosamente.",
            email: req.body.email,
            requires_verification: true,
          },
        });
      }
    }).as("signupReq");

    cy.visit("/signup");
    cy.get('input[placeholder="Tu nombre"]').type("Laura Martínez");
    cy.get('input[placeholder="apodo único"]').type("laura_ia");
    cy.get('input[placeholder="tu@email.com"]').type("duplicado@comunidadia.edu");
    cy.get('input[placeholder="••••••••"]').type("ClaveSegura2026!");
    cy.contains("button", "Registrarse").click();
    cy.wait("@signupReq");
    cy.contains("Correo electrónico: Ya existe un usuario con este email.").should("be.visible");

    cy.get('input[placeholder="tu@email.com"]').clear().type("laura@comunidadia.edu");
    cy.contains("button", "Registrarse").click();
    cy.wait("@signupReq");
    cy.location("pathname").should("eq", "/verify-email");
    cy.location("search").should("include", "laura%40comunidadia.edu");
  });

  it("permite verificar correo por código de 6 dígitos, reenviar código y verificar por enlace", () => {
    cy.mockAnonymousSession();
    cy.intercept("POST", "**/api/auth/resend-verification", {
      statusCode: 200,
      body: { detail: "Nuevo código de verificación enviado a tu correo." },
    }).as("resendReq");

    cy.intercept("POST", "**/api/auth/verify-email", (req) => {
      if (req.body.code === "000000") {
        req.reply({
          statusCode: 400,
          body: { detail: "Código de verificación incorrecto o expirado." },
        });
      } else {
        req.reply({
          statusCode: 200,
          body: { detail: "Cuenta verificada exitosamente." },
        });
      }
    }).as("verifyReq");

    cy.visit("/verify-email?email=laura@comunidadia.edu");
    cy.contains("button", "Reenviar código").click();
    cy.wait("@resendReq");
    cy.contains("Nuevo código de verificación enviado a tu correo.").should("be.visible");

    cy.get('input[placeholder="123456"]').type("000000");
    cy.contains("button", "Confirmar y continuar").click();
    cy.wait("@verifyReq");
    cy.contains("Código de verificación incorrecto o expirado.").should("be.visible");

    cy.get('input[placeholder="123456"]').clear().type("654321");
    cy.contains("button", "Confirmar y continuar").click();
    cy.wait("@verifyReq");
    cy.contains("Cuenta verificada exitosamente.").should("be.visible");

    // Verificación automática mediante enlace con query token
    cy.visit("/verify-email?email=laura@comunidadia.edu&token=enlace-token-valido");
    cy.wait("@verifyReq").its("request.body").should("deep.include", {
      email: "laura@comunidadia.edu",
      token: "enlace-token-valido",
    });
  });

  it("inicia sesión, maneja credenciales inválidas o cuenta sin verificar y cierra sesión", () => {
    cy.mockAnonymousSession();
    cy.intercept("POST", "**/api/auth/login", (req) => {
      if (req.body.email === "pendiente@comunidadia.edu") {
        req.reply({
          statusCode: 403,
          body: { requires_verification: true, detail: "Cuenta sin verificar." },
        });
      } else if (req.body.password === "Incorrecta123") {
        req.reply({ statusCode: 401, body: { detail: "Credenciales inválidas." } });
      } else {
        req.reply({ statusCode: 200, body: { access_token: "token-ok" } });
      }
    }).as("loginReq");

    cy.visit("/signin");
    cy.get('input[type="email"]').type("docente@comunidadia.edu");
    cy.get('input[type="password"]').type("Incorrecta123");
    cy.contains("button", "Entrar").click();
    cy.wait("@loginReq");
    cy.contains("Credenciales inválidas.").should("be.visible");

    cy.get('input[type="email"]').clear().type("pendiente@comunidadia.edu");
    cy.contains("button", "Entrar").click();
    cy.wait("@loginReq");
    cy.location("pathname").should("eq", "/verify-email");

    cy.intercept("GET", "**/api/educator/me", {
      statusCode: 200,
      body: {
        id: 1,
        nick_name: "docente_demo",
        user: { id: 1, name: "Docente Demo", email: "docente@comunidadia.edu", role: "EDUCATOR" },
      },
    }).as("getMe");
    cy.intercept("GET", "**/api/publication/feed*", { statusCode: 200, body: [] });
    cy.intercept("GET", "**/api/subscription/me/following*", { statusCode: 200, body: [] });
    cy.intercept("GET", "**/api/publication/me*", { statusCode: 200, body: [] });

    cy.visit("/signin");
    cy.get('input[type="email"]').type("docente@comunidadia.edu");
    cy.get('input[type="password"]').type("ClaveSegura2026!");
    cy.contains("button", "Entrar").click();
    cy.wait("@loginReq");
    cy.location("pathname").should("eq", "/home");

    cy.intercept("POST", "**/api/auth/logout", { statusCode: 200, body: { detail: "Sesión cerrada" } }).as("logoutReq");
    cy.contains("button", "Salir").click();
    cy.wait("@logoutReq");
    cy.location("pathname").should("be.oneOf", ["/signin", "/inicio"]);
  });

  it("ejecuta el flujo completo de recuperación y restablecimiento de contraseña", () => {
    cy.mockAnonymousSession();
    cy.intercept("POST", "**/api/auth/forgot-password", {
      statusCode: 200,
      body: { detail: "Si el correo está registrado, recibirás un enlace de recuperación." },
    }).as("forgotReq");

    cy.visit("/forgot-password");
    cy.get('input[type="email"]').type("docente@comunidadia.edu");
    cy.contains("button", "Enviar enlace de recuperación").click();
    cy.wait("@forgotReq");
    cy.contains("Si el correo está registrado, recibirás un enlace de recuperación.").should("be.visible");

    // Token ausente
    cy.visit("/reset-password");
    cy.contains("Enlace de recuperación inválido o incompleto.").should("be.visible");

    // Contraseñas distintas y luego restablecimiento válido
    cy.intercept("POST", "**/api/auth/reset-password", {
      statusCode: 200,
      body: { detail: "Contraseña actualizada exitosamente." },
    }).as("resetReq");

    cy.visit("/reset-password?token=token-reset-ok");
    cy.get('input[placeholder="Mínimo 6 caracteres"]').type("NuevaClave2026!");
    cy.get('input[placeholder="Repite la contraseña"]').type("OtraClaveDistinta");
    cy.contains("button", "Actualizar contraseña").click();
    cy.contains("Las contraseñas no coinciden.").should("be.visible");

    cy.get('input[placeholder="Repite la contraseña"]').clear().type("NuevaClave2026!");
    cy.contains("button", "Actualizar contraseña").click();
    cy.wait("@resetReq");
    cy.contains("Contraseña actualizada exitosamente.").should("be.visible");
  });

  it("renueva automáticamente el token de acceso cuando una petición protegida recibe HTTP 401", () => {
    cy.mockAuthenticatedSession();
    let feedCalls = 0;
    cy.intercept("GET", "**/api/publication/feed*", (req) => {
      feedCalls += 1;
      if (feedCalls === 1) {
        req.reply({ statusCode: 401, body: { detail: "Token expirado." } });
      } else {
        req.reply({
          statusCode: 200,
          body: [
            {
              id: 301,
              title: "Publicación recuperada tras refresh JWT",
              publication_type: "ARTICLE",
              created_at: "2026-10-25T10:00:00Z",
              comments_count: 0,
              images_count: 0,
              writer: { id: 2, nick_name: "profe_ana" },
            },
          ],
        });
      }
    }).as("feedRetry");

    cy.visit("/home");
    cy.wait("@feedRetry");
    cy.wait("@feedRetry");
    cy.contains("Publicación recuperada tras refresh JWT").should("be.visible");
  });
});
