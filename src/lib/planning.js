export function daysUntil(dateStr, today = new Date()) {
  const target = new Date(dateStr + 'T00:00:00');
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffMs = target - todayMidnight;
  return Math.round(diffMs / (24 * 60 * 60 * 1000));
}

export function phaseForDaysRemaining(days) {
  if (days < 0) {
    return { id: 'past', label: 'Termin liegt in der Vergangenheit' };
  }
  if (days <= 7) {
    return {
      id: 'selection',
      label: 'Selektionswoche',
      advice: 'Kein neues Training mehr – Fokus auf Schlaf, Ernährung, Ausrüstung bereit.',
    };
  }
  const weeks = Math.ceil(days / 7);
  if (weeks <= 4) {
    return {
      id: 'taper',
      label: 'Taper-Phase',
      advice: 'Volumen reduzieren, Intensität halten, Regeneration priorisieren.',
    };
  }
  if (weeks <= 12) {
    return {
      id: 'intensification',
      label: 'Intensivierungsphase',
      advice: 'Spezifische Belastung steigern: Rucksackmärsche, Zusatzgewicht, Tempo.',
    };
  }
  return {
    id: 'base',
    label: 'Aufbauphase',
    advice: 'Grundlagenausdauer und Kraftbasis aufbauen, Verletzungen vorbeugen.',
  };
}
