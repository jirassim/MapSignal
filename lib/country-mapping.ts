// Maps keywords in market titles to ISO 3166-1 alpha-3 country codes
const COUNTRY_KEYWORDS: Record<string, string[]> = {
  USA: [
    'united states', 'america', 'us ', 'u.s.', 'usa', 'trump', 'biden', 'harris',
    'democrat', 'republican', 'gop', 'congress', 'senate', 'white house',
    'federal reserve', 'fed rate', 'fed funds', 'fomc', 'cpi us', 'gdp us',
    'nfl', 'nba', 'mlb', 'super bowl', 'world series', 'march madness',
    'new york', 'california', 'texas', 'florida', 'michigan', 'nevada',
    'arizona', 'georgia', 'pennsylvania', 'wisconsin', 'north carolina',
    'dow jones', 'nasdaq', 's&p 500', 'sp500', 'wall street',
    'elon musk', 'musk', 'spacex', 'tesla',
    'oscar', 'grammy', 'emmy', 'golden globe',
    'us election', 'presidential', 'midterm',
  ],
  GBR: [
    'united kingdom', 'uk ', 'u.k.', 'britain', 'british', 'england',
    'starmer', 'sunak', 'labour', 'conservative', 'tory', 'parliament',
    'bank of england', 'boe', 'ftse', 'premier league', 'epl',
    'london', 'scotland', 'wales', 'northern ireland', 'brexit',
  ],
  CHN: [
    'china', 'chinese', 'beijing', 'xi jinping', 'ccp', 'prc',
    'shanghai', 'shenzhen', 'pboc', 'yuan', 'renminbi', 'taiwan strait',
    'south china sea', 'hong kong',
  ],
  RUS: [
    'russia', 'russian', 'putin', 'moscow', 'kremlin', 'ruble',
    'gazprom', 'nord stream',
  ],
  UKR: [
    'ukraine', 'ukrainian', 'kyiv', 'kiev', 'zelensky', 'zelenskyy',
    'donbas', 'crimea', 'ceasefire', 'kherson', 'zaporizhzhia',
  ],
  DEU: [
    'germany', 'german', 'berlin', 'merkel', 'scholz', 'bundestag',
    'bundesliga', 'dax', 'ecb', 'gdp germany', 'deutsche',
  ],
  FRA: [
    'france', 'french', 'paris', 'macron', 'le pen', 'ligue 1',
    'cac 40', 'élysée',
  ],
  JPN: [
    'japan', 'japanese', 'tokyo', 'yen', 'boj', 'bank of japan',
    'nikkei', 'gdp japan',
  ],
  KOR: [
    'south korea', 'korean', 'seoul', 'k-pop', 'samsung', 'kospi',
  ],
  IND: [
    'india', 'indian', 'modi', 'mumbai', 'delhi', 'nifty', 'sensex',
    'rupee', 'rbi',
  ],
  BRA: [
    'brazil', 'brazilian', 'lula', 'bolsonaro', 'são paulo', 'brasilia',
    'real ', 'bovespa',
  ],
  AUS: [
    'australia', 'australian', 'sydney', 'melbourne', 'canberra',
    'asx', 'rba', 'aussie dollar',
  ],
  CAN: [
    'canada', 'canadian', 'trudeau', 'ottawa', 'toronto', 'tsx',
    'bank of canada', 'loonie',
  ],
  MEX: [
    'mexico', 'mexican', 'amlo', 'peso', 'mexico city',
  ],
  ARG: [
    'argentina', 'argentine', 'milei', 'buenos aires',
  ],
  TUR: [
    'turkey', 'turkish', 'türkiye', 'erdogan', 'ankara', 'istanbul', 'lira',
  ],
  ISR: [
    'israel', 'israeli', 'netanyahu', 'tel aviv', 'jerusalem', 'idf',
    'hamas', 'gaza', 'hezbollah',
  ],
  PSE: [
    'palestine', 'palestinian', 'gaza', 'west bank', 'hamas',
  ],
  IRN: [
    'iran', 'iranian', 'tehran', 'khamenei', 'rial',
  ],
  SAU: [
    'saudi', 'arabia', 'riyadh', 'mbs', 'aramco', 'opec',
  ],
  ITA: [
    'italy', 'italian', 'rome', 'meloni', 'serie a', 'ftse mib',
  ],
  ESP: [
    'spain', 'spanish', 'madrid', 'barcelona', 'la liga', 'ibex',
  ],
  POL: [
    'poland', 'polish', 'warsaw', 'tusk',
  ],
  NLD: [
    'netherlands', 'dutch', 'amsterdam', 'wilders',
  ],
  SWE: [
    'sweden', 'swedish', 'stockholm',
  ],
  NOR: [
    'norway', 'norwegian', 'oslo',
  ],
  CHE: [
    'switzerland', 'swiss', 'zurich', 'snb',
  ],
  ZAF: [
    'south africa', 'johannesburg', 'anc', 'rand',
  ],
  NGA: [
    'nigeria', 'nigerian', 'lagos', 'abuja', 'naira',
  ],
  EGY: [
    'egypt', 'egyptian', 'cairo', 'sisi',
  ],
  KEN: [
    'kenya', 'kenyan', 'nairobi',
  ],
  IDN: [
    'indonesia', 'indonesian', 'jakarta', 'rupiah',
  ],
  THA: [
    'thailand', 'thai', 'bangkok', 'baht',
  ],
  VNM: [
    'vietnam', 'vietnamese', 'hanoi', 'ho chi minh',
  ],
  PHL: [
    'philippines', 'philippine', 'manila', 'marcos',
  ],
  MYS: [
    'malaysia', 'malaysian', 'kuala lumpur',
  ],
  SGP: [
    'singapore', 'singaporean',
  ],
  TWN: [
    'taiwan', 'taiwanese', 'taipei', 'tsmc',
  ],
  COL: [
    'colombia', 'colombian', 'bogota',
  ],
  CHL: [
    'chile', 'chilean', 'santiago',
  ],
  PER: [
    'peru', 'peruvian', 'lima',
  ],
  VEN: [
    'venezuela', 'venezuelan', 'maduro', 'caracas',
  ],
  NZL: [
    'new zealand', 'kiwi', 'auckland', 'wellington',
  ],
  IRQ: [
    'iraq', 'iraqi', 'baghdad',
  ],
  SYR: [
    'syria', 'syrian', 'damascus', 'assad',
  ],
  LBN: [
    'lebanon', 'lebanese', 'beirut',
  ],
  PRK: [
    'north korea', 'dprk', 'pyongyang', 'kim jong',
  ],
  PAK: [
    'pakistan', 'pakistani', 'islamabad', 'karachi',
  ],
  AFG: [
    'afghanistan', 'afghan', 'kabul', 'taliban',
  ],
  MMR: [
    'myanmar', 'burma', 'burmese',
  ],
  ETH: [
    'ethiopia', 'ethiopian', 'addis ababa',
  ],
  SDN: [
    'sudan', 'sudanese', 'khartoum',
  ],
  UGA: [
    'uganda', 'ugandan', 'kampala',
  ],
  TZA: [
    'tanzania', 'tanzanian', 'dar es salaam',
  ],
  PRT: [
    'portugal', 'portuguese', 'lisbon',
  ],
  GRC: [
    'greece', 'greek', 'athens',
  ],
  ROU: [
    'romania', 'romanian', 'bucharest',
  ],
  HUN: [
    'hungary', 'hungarian', 'budapest', 'orban',
  ],
  CZE: [
    'czech', 'czechia', 'prague',
  ],
  AUT: [
    'austria', 'austrian', 'vienna',
  ],
  BEL: [
    'belgium', 'belgian', 'brussels',
  ],
  DNK: [
    'denmark', 'danish', 'copenhagen',
  ],
  FIN: [
    'finland', 'finnish', 'helsinki',
  ],
  IRL: [
    'ireland', 'irish', 'dublin',
  ],
  UZB: [
    'uzbekistan',
  ],
  KAZ: [
    'kazakhstan', 'astana',
  ],
  GEO: [
    'georgia tbilisi',
  ],
  ARE: [
    'uae', 'emirates', 'dubai', 'abu dhabi',
  ],
  QAT: [
    'qatar', 'doha',
  ],
  KWT: [
    'kuwait',
  ],
  BHR: [
    'bahrain',
  ],
  OMN: [
    'oman', 'muscat',
  ],
  CUB: [
    'cuba', 'cuban', 'havana',
  ],
  HTI: [
    'haiti', 'haitian',
  ],
  DOM: [
    'dominican republic', 'santo domingo',
  ],
  ECU: [
    'ecuador', 'quito',
  ],
  BOL: [
    'bolivia', 'la paz',
  ],
  PRY: [
    'paraguay', 'asuncion',
  ],
  URY: [
    'uruguay', 'montevideo',
  ],
}

// Category keywords for classification
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  politics: [
    'election', 'president', 'prime minister', 'vote', 'poll', 'party',
    'democrat', 'republican', 'labour', 'conservative', 'coalition',
    'senate', 'congress', 'parliament', 'governor', 'mayor',
    'impeach', 'resign', 'cabinet', 'minister',
  ],
  economy: [
    'gdp', 'inflation', 'cpi', 'interest rate', 'fed', 'central bank',
    'unemployment', 'recession', 'growth', 'trade', 'tariff',
    'stock', 'market', 'index', 'bond', 'yield', 'debt',
    'fomc', 'boe', 'ecb', 'boj', 'pboc',
  ],
  geopolitics: [
    'war', 'conflict', 'ceasefire', 'peace', 'invasion', 'sanction',
    'nato', 'un ', 'united nations', 'treaty', 'nuclear', 'missile',
    'military', 'troops', 'alliance', 'embargo',
  ],
  sports: [
    'nfl', 'nba', 'mlb', 'nhl', 'premier league', 'champions league',
    'world cup', 'olympic', 'super bowl', 'championship', 'playoff',
    'tournament', 'match', 'game', 'season', 'mvp', 'finals',
    'serie a', 'la liga', 'bundesliga', 'ligue 1',
  ],
  crypto: [
    'bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'defi', 'nft',
    'blockchain', 'token', 'altcoin', 'solana', 'cardano',
  ],
  climate: [
    'climate', 'temperature', 'warming', 'carbon', 'emission',
    'renewable', 'hurricane', 'earthquake', 'flood', 'wildfire',
    'drought', 'sea level', 'glacier',
  ],
  science: [
    'ai ', 'artificial intelligence', 'agi', 'space', 'mars', 'moon',
    'nasa', 'spacex', 'vaccine', 'virus', 'pandemic', 'fda',
    'research', 'discovery', 'quantum',
  ],
}

export function detectCountry(title: string): { code: string; name: string } | null {
  const lower = title.toLowerCase()

  for (const [code, keywords] of Object.entries(COUNTRY_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        return { code, name: getCountryName(code) }
      }
    }
  }

  return null
}

export function detectCategory(title: string): string {
  const lower = title.toLowerCase()

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return cat
    }
  }

  return 'other'
}

function getCountryName(code: string): string {
  const names: Record<string, string> = {
    USA: 'United States', GBR: 'United Kingdom', CHN: 'China', RUS: 'Russia',
    UKR: 'Ukraine', DEU: 'Germany', FRA: 'France', JPN: 'Japan',
    KOR: 'South Korea', IND: 'India', BRA: 'Brazil', AUS: 'Australia',
    CAN: 'Canada', MEX: 'Mexico', ARG: 'Argentina', TUR: 'Turkey',
    ISR: 'Israel', PSE: 'Palestine', IRN: 'Iran', SAU: 'Saudi Arabia',
    ITA: 'Italy', ESP: 'Spain', POL: 'Poland', NLD: 'Netherlands',
    SWE: 'Sweden', NOR: 'Norway', CHE: 'Switzerland', ZAF: 'South Africa',
    NGA: 'Nigeria', EGY: 'Egypt', KEN: 'Kenya', IDN: 'Indonesia',
    THA: 'Thailand', VNM: 'Vietnam', PHL: 'Philippines', MYS: 'Malaysia',
    SGP: 'Singapore', TWN: 'Taiwan', COL: 'Colombia', CHL: 'Chile',
    PER: 'Peru', VEN: 'Venezuela', NZL: 'New Zealand', IRQ: 'Iraq',
    SYR: 'Syria', LBN: 'Lebanon', PRK: 'North Korea', PAK: 'Pakistan',
    AFG: 'Afghanistan', MMR: 'Myanmar', ETH: 'Ethiopia', SDN: 'Sudan',
    UGA: 'Uganda', TZA: 'Tanzania', PRT: 'Portugal', GRC: 'Greece',
    ROU: 'Romania', HUN: 'Hungary', CZE: 'Czech Republic', AUT: 'Austria',
    BEL: 'Belgium', DNK: 'Denmark', FIN: 'Finland', IRL: 'Ireland',
    UZB: 'Uzbekistan', KAZ: 'Kazakhstan', GEO: 'Georgia', ARE: 'UAE',
    QAT: 'Qatar', KWT: 'Kuwait', BHR: 'Bahrain', OMN: 'Oman',
    CUB: 'Cuba', HTI: 'Haiti', DOM: 'Dominican Republic', ECU: 'Ecuador',
    BOL: 'Bolivia', PRY: 'Paraguay', URY: 'Uruguay',
  }
  return names[code] || code
}

// Map ISO alpha-3 to alpha-2 for GeoJSON matching
export const ALPHA3_TO_ALPHA2: Record<string, string> = {
  USA: 'US', GBR: 'GB', CHN: 'CN', RUS: 'RU', UKR: 'UA', DEU: 'DE',
  FRA: 'FR', JPN: 'JP', KOR: 'KR', IND: 'IN', BRA: 'BR', AUS: 'AU',
  CAN: 'CA', MEX: 'MX', ARG: 'AR', TUR: 'TR', ISR: 'IL', PSE: 'PS',
  IRN: 'IR', SAU: 'SA', ITA: 'IT', ESP: 'ES', POL: 'PL', NLD: 'NL',
  SWE: 'SE', NOR: 'NO', CHE: 'CH', ZAF: 'ZA', NGA: 'NG', EGY: 'EG',
  KEN: 'KE', IDN: 'ID', THA: 'TH', VNM: 'VN', PHL: 'PH', MYS: 'MY',
  SGP: 'SG', TWN: 'TW', COL: 'CO', CHL: 'CL', PER: 'PE', VEN: 'VE',
  NZL: 'NZ', IRQ: 'IQ', SYR: 'SY', LBN: 'LB', PRK: 'KP', PAK: 'PK',
  AFG: 'AF', MMR: 'MM', ETH: 'ET', SDN: 'SD', UGA: 'UG', TZA: 'TZ',
  PRT: 'PT', GRC: 'GR', ROU: 'RO', HUN: 'HU', CZE: 'CZ', AUT: 'AT',
  BEL: 'BE', DNK: 'DK', FIN: 'FI', IRL: 'IE', UZB: 'UZ', KAZ: 'KZ',
  GEO: 'GE', ARE: 'AE', QAT: 'QA', KWT: 'KW', BHR: 'BH', OMN: 'OM',
  CUB: 'CU', HTI: 'HT', DOM: 'DO', ECU: 'EC', BOL: 'BO', PRY: 'PY',
  URY: 'UY',
}
