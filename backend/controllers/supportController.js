/**
 * Stepped local support directory controller for filtering verified helplines and clinics.
 */
const SupportService = require('../models/SupportService');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const { ensureSupportServicesSeeded } = require('../data/seedSupportServices');
const { resolveLanguage, t } = require('../utils/i18n');

/**
 * Lists support services matching optional country, region, category, and language filters.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
exports.listServices = async (req, res) => {
  const { country, region, category, lang } = req.query;
  const activeLang = resolveLanguage(req);

  try {
    const filter = {};
    if (country && country !== 'ALL') {
      filter.country = { $in: [country.toUpperCase(), 'GLOBAL'] };
    }
    if (region && region !== 'ALL') {
      filter.region = new RegExp(`^${region.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    }
    if (category && category !== 'ALL') {
      filter.category = category;
    }
    if (lang && lang !== 'ALL') {
      filter.languages = lang.toLowerCase();
    }

    let [services] = await Promise.all([
      SupportService.find(filter).sort({ country: 1, category: 1 }).lean(),
      AnalyticsEvent.create({
        eventType: 'directory_viewed',
        language: activeLang,
        country: (country || 'ID').toUpperCase(),
        metadata: { category: category || 'ALL' },
      }).catch(() => {}),
    ]);

    if (services.length === 0) {
      await ensureSupportServicesSeeded();
      services = await SupportService.find(filter).sort({ country: 1, category: 1 }).lean();
    }

    res.json(services);
  } catch (err) {
    console.error('Error listServices:', err.message);
    res.status(500).json({ error: t(activeLang, 'serverError') });
  }
};
