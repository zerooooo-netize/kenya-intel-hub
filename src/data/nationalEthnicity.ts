// Official national ethnic affiliation totals — KNBS 2019 Kenya Population and
// Housing Census, Volume IV, Table 2.31 (pp. 422–423). National level only:
// KNBS does not publish these figures by county.
export const ETHNICITY_SOURCE = {
  title: "KNBS 2019 Census, Vol. IV, Table 2.31",
  url: "https://www.knbs.or.ke/wp-content/uploads/2023/09/2019-Kenya-population-and-Housing-Census-Volume-4-Distribution-of-Population-by-Socio-Economic-Characteristics.pdf",
  published: "December 2019",
  totalPopulation: 47_564_296,
};

export const NATIONAL_ETHNICITY: { name: string; population: number }[] = [
  { name: "Kikuyu", population: 8_148_668 },
  { name: "Luhya", population: 6_823_842 },
  { name: "Kalenjin", population: 6_358_113 },
  { name: "Luo", population: 5_066_966 },
  { name: "Kamba", population: 4_663_910 },
  { name: "Kenyan Somali", population: 2_780_502 },
  { name: "Kisii", population: 2_703_235 },
  { name: "Mijikenda", population: 2_488_691 },
  { name: "Meru", population: 1_975_869 },
  { name: "Maasai", population: 1_189_522 },
  { name: "Turkana", population: 1_016_174 },
  { name: "Teso", population: 417_670 },
  { name: "Embu", population: 404_801 },
  { name: "Taita", population: 344_415 },
  { name: "Samburu", population: 333_471 },
  { name: "Kuria", population: 313_854 },
];

export const ETHNICITY_COLORS = [
  "hsl(265 80% 62%)", "hsl(200 85% 55%)", "hsl(150 70% 48%)", "hsl(30 90% 58%)",
  "hsl(340 80% 60%)", "hsl(50 90% 55%)", "hsl(180 70% 45%)", "hsl(0 75% 60%)",
  "hsl(285 60% 55%)", "hsl(220 70% 65%)", "hsl(100 50% 50%)", "hsl(15 70% 50%)",
  "hsl(240 40% 60%)", "hsl(170 40% 55%)", "hsl(320 45% 55%)", "hsl(60 40% 50%)",
];
