// Kenya's elective structure — Constitution of Kenya 2010 (Arts. 97, 98, 177,
// 180, 89) and IEBC boundaries used in the 2022 General Election.
export const STRUCTURE_SOURCE = {
  title: "Constitution of Kenya 2010 · IEBC 2022 boundaries",
  url: "https://www.iebc.or.ke/electoral/?Structure",
};

export const NATIONAL_STRUCTURE = {
  counties: 47,
  constituencies: 290,
  wards: 1450,
  president: 1,
  governors: 47,
  senate: { total: 67, elected: 47, nominatedWomen: 16, youth: 2, disability: 2 },
  nationalAssembly: { total: 349, constituencyMPs: 290, womenReps: 47, nominated: 12 },
  mcasElected: 1450,
};

export type ScopeLevel = "national" | "county" | "constituency";

/** Seats a voter votes for at each scope (the six-ballot system). */
export const seatsAt = (level: ScopeLevel, constituencies = 0) => {
  if (level === "national") {
    return [
      { label: "President", value: 1 },
      { label: "Governors", value: 47 },
      { label: "Senators (elected)", value: 47 },
      { label: "Woman Reps", value: 47 },
      { label: "MPs (constituency)", value: 290 },
      { label: "MCAs (wards)", value: 1450 },
    ];
  }
  if (level === "county") {
    return [
      { label: "Governor", value: 1 },
      { label: "Senator", value: 1 },
      { label: "Woman Rep", value: 1 },
      { label: "MPs", value: constituencies },
    ];
  }
  return [{ label: "MP", value: 1 }];
};
