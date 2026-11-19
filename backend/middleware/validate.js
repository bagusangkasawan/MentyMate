const { resolveLanguage, t } = require('../utils/i18n');

/**
 * Express middleware that validates req.body against a Zod schema.
 * @param {import('zod').ZodTypeAny} schema
 * @returns {import('express').RequestHandler}
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const lang = resolveLanguage(req);
      const issues = result.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      }));
      return res.status(400).json({
        error: t(lang, 'validationFailed'),
        message: t(lang, 'validationFailed'),
        issues,
      });
    }
    req.body = result.data;
    next();
  };
}

module.exports = { validate };
