const EMERGENCY_CONTACTS_BY_COUNTRY = {
  ID: [
    {
      name: { en: 'Indonesian Emergency Services', id: 'Layanan Darurat Nasional' },
      phone: '112',
      available: '24/7',
      type: 'emergency',
    },
    {
      name: { en: 'Ministry of Health Emergency / Ambulance', id: 'Kemenkes / Ambulans Darurat' },
      phone: '119',
      available: '24/7',
      type: 'medical',
    },
    {
      name: { en: 'LISA Suicide Prevention Helpline', id: 'Saluran Bantuan LISA (Pencegahan Bunuh Diri)' },
      phone: '+628113855472',
      available: '24/7',
      type: 'crisis_helpline',
    },
    {
      name: { en: 'HIMPSI / SEJIWA Psychological Support', id: 'Layanan Konseling Psikologi SEJIWA / HIMPSI' },
      phone: '119',
      extension: '8',
      available: '08:00 - 20:00 WIB',
      type: 'counseling',
    },
  ],
  AE: [
    {
      name: {
        en: 'Department of Health Abu Dhabi (Estijaba Support)',
        id: 'Departemen Kesehatan Abu Dhabi (Layanan Estijaba)',
      },
      phone: '8001717',
      available: '24/7',
      type: 'crisis_helpline',
    },
    {
      name: { en: 'UAE Emergency Services', id: 'Layanan Darurat UEA' },
      phone: '999',
      available: '24/7',
      type: 'emergency',
    },
    {
      name: { en: 'UAE National Ambulance', id: 'Ambulans Nasional UEA' },
      phone: '998',
      available: '24/7',
      type: 'medical',
    },
  ],
  US: [
    {
      name: { en: '988 Suicide & Crisis Lifeline', id: '988 Suicide & Crisis Lifeline' },
      phone: '988',
      available: '24/7',
      type: 'crisis_helpline',
    },
    {
      name: { en: 'US Emergency Services', id: 'Layanan Darurat AS' },
      phone: '911',
      available: '24/7',
      type: 'emergency',
    },
  ],
  GB: [
    {
      name: { en: 'NHS Mental Health Services', id: 'Layanan Kesehatan Mental NHS' },
      phone: '111',
      available: '24/7',
      type: 'crisis_helpline',
    },
    {
      name: { en: 'UK Emergency Services', id: 'Layanan Darurat Inggris' },
      phone: '999',
      available: '24/7',
      type: 'emergency',
    },
  ],
  GLOBAL: [
    {
      name: { en: 'International Helpline Directory (Find A Helpline)', id: 'Direktori Bantuan Internasional (Find A Helpline)' },
      url: 'https://findahelpline.com/',
      available: '24/7',
      type: 'directory',
    },
    {
      name: { en: 'Befrienders Worldwide', id: 'Befrienders Worldwide' },
      url: 'https://www.befrienders.org/',
      available: '24/7',
      type: 'directory',
    },
  ],
};

const CRISIS_COPY = {
  en: {
    title: 'Immediate Human Support Is Available',
    lead: 'It sounds like you may be going through a very difficult or unsafe moment. You do not have to carry this alone.',
    disclaimer:
      'MentyMate is an AI wellbeing companion, not a clinical service or emergency responder. Please reach out to a trained human professional or someone you trust right now.',
    steps: [
      'If you are in immediate physical danger, call your local emergency number right away.',
      'Contact a dedicated crisis helpline to speak with a trained human responder.',
      'Reach out to a trusted friend, family member, or campus/school counselor and let them know you need support.',
    ],
    chatReply:
      'I hear how heavy things feel right now, and your safety matters most. Because MentyMate is not a clinical or emergency service, please connect immediately with a trained human responder or someone you trust using the emergency support options shown.',
    acknowledgeLabel: 'I have reviewed these support options',
  },
  id: {
    title: 'Bantuan Manusia Tersedia Sekarang',
    lead: 'Sepertinya kamu sedang berada dalam kondisi yang sangat berat atau berisiko. Kamu tidak harus menghadapi ini sendirian.',
    disclaimer:
      'MentyMate adalah pendamping kesejahteraan berbasis AI, bukan layanan klinis maupun penanggap darurat. Segera hubungi tenaga profesional terlatih atau orang tepercaya sekarang juga.',
    steps: [
      'Jika kamu berada dalam bahaya fisik langsung, segera hubungi nomor darurat setempat.',
      'Hubungi saluran bantuan krisis untuk berbicara langsung dengan konselor manusia terlatih.',
      'Hubungi teman tepercaya, anggota keluarga, atau konselor sekolah/kampus agar kamu tidak sendirian.',
    ],
    chatReply:
      'Saya mendengar betapa beratnya kondisi yang kamu rasakan saat ini, dan keselamatanmu adalah yang utama. Karena MentyMate bukan layanan klinis atau darurat, mohon segera hubungi bantuan manusia terlatih atau orang tepercaya melalui panduan keselamatan yang ditampilkan.',
    acknowledgeLabel: 'Saya sudah membaca panduan bantuan ini',
  },
};

function getCrisisProtocol(language = 'en', country = 'ID') {
  const lang = language === 'id' ? 'id' : 'en';
  const upperCountry = (country || 'ID').toUpperCase();
  const localContacts =
    EMERGENCY_CONTACTS_BY_COUNTRY[upperCountry] || EMERGENCY_CONTACTS_BY_COUNTRY.ID;
  const globalContacts = EMERGENCY_CONTACTS_BY_COUNTRY.GLOBAL;

  const mapContact = (c) => ({
    name: c.name[lang] || c.name.en,
    phone: c.phone || null,
    extension: c.extension || null,
    url: c.url || null,
    available: c.available,
    type: c.type,
  });

  return {
    language: lang,
    country: upperCountry,
    ...CRISIS_COPY[lang],
    localContacts: localContacts.map(mapContact),
    globalContacts: globalContacts.map(mapContact),
  };
}

module.exports = { getCrisisProtocol, EMERGENCY_CONTACTS_BY_COUNTRY };
