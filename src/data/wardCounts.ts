// Official County Assembly Ward counts per county (1,450 total) — IEBC,
// County Assembly Wards Order (Legal Notice No. 14 of 2012), used in 2017 and 2022.
// Ward outlines: Omare B.D.A. & Omare G.J.M. (2017), "Kenya County Assembly
// Boundaries", CC-BY-4.0, digitised from IEBC maps (doi:10.5281/zenodo.3832025).
export const WARD_SOURCE = {
  title: "IEBC County Assembly Wards (Legal Notice 14, 2012)",
  url: "https://www.iebc.or.ke/electoral/?Structure",
  outlines: "Ward outlines: Omare & Omare 2017 (CC-BY-4.0)",
  outlinesUrl: "https://github.com/benaboki/Kenya-County-Assembly-Boundaries",
};

export const WARDS_PER_COUNTY: Record<string, number> = {
  Baringo: 30, Bomet: 25, Bungoma: 45, Busia: 35, "Elgeyo Marakwet": 20, Embu: 20,
  Garissa: 30, "Homa Bay": 40, Isiolo: 10, Kajiado: 25, Kakamega: 60, Kericho: 30,
  Kiambu: 60, Kilifi: 35, Kirinyaga: 20, Kisii: 45, Kisumu: 35, Kitui: 40, Kwale: 20,
  Laikipia: 15, Lamu: 10, Machakos: 40, Makueni: 30, Mandera: 30, Marsabit: 20,
  Meru: 45, Migori: 40, Mombasa: 30, "Murang'a": 35, Nairobi: 85, Nakuru: 55,
  Nandi: 30, Narok: 30, Nyamira: 20, Nyandarua: 25, Nyeri: 30, Samburu: 15, Siaya: 30,
  "Taita Taveta": 20, "Tana River": 15, "Tharaka Nithi": 15, "Trans Nzoia": 25,
  Turkana: 30, "Uasin Gishu": 30, Vihiga: 25, Wajir: 30, "West Pokot": 20,
};

/** 10 wards → cool, 85 wards → warm. */
export const wardColor = (n: number) => {
  const t = Math.max(0, Math.min(1, (n - 10) / 75));
  return `hsl(${220 - t * 190} 75% ${30 + t * 25}%)`;
};
