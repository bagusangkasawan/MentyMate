const path = require('path');
const crypto = require('crypto');
const swaggerJSDoc = require('swagger-jsdoc');
const dotenv = require('dotenv');

dotenv.config();

const SWAGGER_UI_ORIGIN = 'https://unpkg.com';
const SWAGGER_UI_CDN = `${SWAGGER_UI_ORIGIN}/swagger-ui-dist@5.35.0`;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MentyMate API',
      version: '1.0.0',
      description:
        'Bilingual (EN/ID) mental wellbeing API for authentication, consent-gated daily check-ins, PHQ-9/GAD-7 assessments, deterministic crisis escalation, Gemini AI companion, stepped care directory, and PII-free analytics.',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    path.join(__dirname, 'routes/*.js').replace(/\\/g, '/'),
    path.join(__dirname, 'app.js').replace(/\\/g, '/'),
  ],
};

const swaggerSpec = swaggerJSDoc(options);

const swaggerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MentyMate API Docs</title>
  <link rel="stylesheet" href="${SWAGGER_UI_CDN}/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="${SWAGGER_UI_CDN}/swagger-ui-bundle.js"></script>
  <script src="${SWAGGER_UI_CDN}/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function () {
      window.ui = SwaggerUIBundle({
        url: '/api/docs.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: 'StandaloneLayout'
      });
    };
  </script>
</body>
</html>`;

/**
 * Enforces HTTP Basic Auth on Swagger routes when `SWAGGER_PASSWORD` is configured.
 * Uses constant-time SHA-256 comparison to prevent timing side-channels.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void}
 */
function requireSwaggerAuth(req, res, next) {
  const expectedPass = process.env.SWAGGER_PASSWORD;
  if (!expectedPass) {
    // Fail closed in production if SWAGGER_PASSWORD is not configured.
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).send('Not found.');
    }
    return next();
  }

  const sendChallenge = (message) => {
    res.setHeader('WWW-Authenticate', 'Basic realm="MentyMate API Docs"');
    return res.status(401).send(message);
  };

  const expectedUser = process.env.SWAGGER_USER || 'admin';
  const authHeader = req.headers.authorization || '';
  const [scheme, encoded] = authHeader.split(' ');

  if (scheme !== 'Basic' || !encoded) {
    return sendChallenge('Authentication required.');
  }

  const decoded = Buffer.from(encoded, 'base64').toString('utf8');
  const sepIdx = decoded.indexOf(':');
  const user = sepIdx >= 0 ? decoded.slice(0, sepIdx) : '';
  const pass = sepIdx >= 0 ? decoded.slice(sepIdx + 1) : '';

  const hash = (val) => crypto.createHash('sha256').update(val).digest();
  const userMatch = crypto.timingSafeEqual(hash(user), hash(expectedUser));
  const passMatch = crypto.timingSafeEqual(hash(pass), hash(expectedPass));

  if (!userMatch || !passMatch) {
    return sendChallenge('Invalid credentials.');
  }

  return next();
}

/**
 * Mounts OpenAPI JSON (`/api/docs.json`) and CDN-backed Swagger UI (`/api/docs`)
 * so documentation renders reliably in both local Node and Vercel serverless environments.
 * @param {import('express').Express} app
 * @returns {void}
 */
function setupSwagger(app) {
  app.get('/api/docs.json', requireSwaggerAuth, (req, res) => {
    const activeServerUrl = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;
    res.json({
      ...swaggerSpec,
      servers: [{ url: activeServerUrl }],
    });
  });

  app.get(['/api/docs', '/api/docs/'], requireSwaggerAuth, (req, res) => {
    // Allow Swagger UI CDN assets & inline bootstrap script on the docs route while keeping Helmet strict elsewhere.
    res.setHeader(
      'Content-Security-Policy',
      `default-src 'self'; style-src 'self' 'unsafe-inline' ${SWAGGER_UI_ORIGIN}; script-src 'self' 'unsafe-inline' ${SWAGGER_UI_ORIGIN}; img-src 'self' data: ${SWAGGER_UI_ORIGIN}; connect-src 'self' *;`
    );
    res.type('html').send(swaggerHtml);
  });
}

module.exports = setupSwagger;
