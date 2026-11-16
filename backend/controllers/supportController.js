const SupportService = require('../models/SupportService');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const { resolveLanguage, t } = require('../utils/i18n');

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

    const services = await SupportService.find(filter).sort({ country: 1, category: 1 });

    await AnalyticsEvent.create({
      eventType: 'directory_viewed',
      language: activeLang,
      country: (country || 'ID').toUpperCase(),
      metadata: { category: category || 'ALL' },
    }).catch(() => {});

    res.json(services);
  } catch (err) {
    console.error('Error listServices:', err.message);
    res.status(500).json({ error: t(activeLang, 'serverError') });
  }
};
