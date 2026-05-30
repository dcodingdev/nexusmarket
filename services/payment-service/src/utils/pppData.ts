export const pppData: Record<string, number> = {
  US: 1.0, // United States
  GB: 1.0, // United Kingdom
  CA: 1.0, // Canada
  AU: 1.0, // Australia
  DE: 1.0, // Germany
  FR: 1.0, // France
  JP: 1.0, // Japan
  IN: 0.4, // India
  BR: 0.5, // Brazil
  ZA: 0.6, // South Africa
  NG: 0.3, // Nigeria
  ID: 0.4, // Indonesia
  PH: 0.5, // Philippines
  MX: 0.6, // Mexico
  TR: 0.4, // Turkey
  AR: 0.4, // Argentina
  RU: 0.5, // Russia
  CO: 0.5, // Colombia
  EG: 0.3, // Egypt
  PK: 0.3, // Pakistan
  BD: 0.3, // Bangladesh
};

/**
 * Returns the PPP multiplier for a given country code (ISO 3166-1 alpha-2).
 * Defaults to 1.0 if the country is not found in the mapping.
 */
export const getPppMultiplier = (countryCode?: string): number => {
  if (!countryCode) return 1.0;
  const upperCode = countryCode.toUpperCase();
  return pppData[upperCode] ?? 1.0;
};
