export const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sitzend (Bürojob, wenig Bewegung)', factor: 1.2 },
  { id: 'light', label: 'Gehend/stehend (aktiver Alltag)', factor: 1.375 },
  { id: 'heavy', label: 'Körperlich fordernd (viel Bewegung im Alltag)', factor: 1.55 },
];

export const DEFICIT_LEVELS = [
  { id: 'slow', label: 'Langsam (−300 kcal/Tag)', kcal: 300 },
  { id: 'moderate', label: 'Moderat (−500 kcal/Tag)', kcal: 500 },
  { id: 'aggressive', label: 'Ambitioniert (−750 kcal/Tag)', kcal: 750 },
];

// Rough MET (metabolic equivalent) values per tour type, used to estimate
// calories burned from logged duration and body weight.
export const MET_BY_TYPE = {
  Marsch: 7,
  Lauf: 9.8,
  Wanderung: 6,
  Rad: 7.5,
  Kraft: 5,
  Sonstiges: 6,
};

export function bmr({ weightKg, heightCm, age, gender }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'male') return base + 5;
  if (gender === 'female') return base - 161;
  return base - 78;
}

export function tdee(bmrValue, activityLevelId) {
  const level = ACTIVITY_LEVELS.find((l) => l.id === activityLevelId) ?? ACTIVITY_LEVELS[0];
  return bmrValue * level.factor;
}

export function tourKcal(tour, weightKg) {
  const durationMin = Number(tour.durationMin) || 0;
  const met = MET_BY_TYPE[tour.type] ?? MET_BY_TYPE.Sonstiges;
  const extraBonus = Number(tour.extraWeightKg) > 0 ? 1 : 0;
  return Math.round((met + extraBonus) * (Number(weightKg) || 0) * (durationMin / 60));
}
