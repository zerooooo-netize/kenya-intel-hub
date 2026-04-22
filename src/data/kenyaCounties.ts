// Kenya's 47 counties — used in candidate onboarding
export const KENYA_COUNTIES = [
  "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu",
  "Garissa", "Homa Bay", "Isiolo", "Kajiado", "Kakamega", "Kericho",
  "Kiambu", "Kilifi", "Kirinyaga", "Kisii", "Kisumu", "Kitui",
  "Kwale", "Laikipia", "Lamu", "Machakos", "Makueni", "Mandera",
  "Marsabit", "Meru", "Migori", "Mombasa", "Murang'a", "Nairobi",
  "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua", "Nyeri",
  "Samburu", "Siaya", "Taita-Taveta", "Tana River", "Tharaka-Nithi",
  "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot",
] as const;

export const KENYA_PARTIES = [
  "UDA", "ODM", "Jubilee", "Wiper", "ANC", "Ford-Kenya",
  "DAP-Kenya", "PAA", "MDG", "TSP", "Independent", "Other",
] as const;

export const ASPIRED_POSITIONS = [
  { value: "president", label: "President", scope: "National" },
  { value: "deputy_president", label: "Deputy President", scope: "National" },
  { value: "governor", label: "Governor", scope: "County" },
  { value: "senator", label: "Senator", scope: "County" },
  { value: "woman_representative", label: "Woman Representative", scope: "County" },
  { value: "mp", label: "Member of Parliament (MP)", scope: "Constituency" },
  { value: "mca", label: "Member of County Assembly (MCA)", scope: "Ward" },
] as const;

export type AspiredPosition = (typeof ASPIRED_POSITIONS)[number]["value"];

export const SUGGESTED_TOPICS = [
  "Economy & Jobs", "Healthcare", "Education", "Infrastructure",
  "Agriculture", "Security", "Youth Empowerment", "Women & Gender",
  "Climate & Environment", "Anti-Corruption", "Devolution", "Housing",
  "Water & Sanitation", "Digital Economy", "Trade & SMEs", "Sports & Arts",
];
