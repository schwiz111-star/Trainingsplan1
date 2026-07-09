export const CHALLENGE_POOL = [
  'Kalt duschen – 60 Sekunden am Stück.',
  'Vor dem Frühstück aufstehen und Bett direkt machen, kein Snooze.',
  '20 Minuten in völliger Stille sitzen, ohne Handy.',
  'Einen Tagesrucksack packen und 5 km zügig marschieren.',
  '50 Liegestütze verteilt über den Tag, jederzeit wenn es unbequem ist.',
  'Ein kaltes Bad oder Eisbad für 3 Minuten.',
  'Vor 6 Uhr aufstehen und direkt trainieren.',
  'Ein Gespräch führen, das du sonst vermeiden würdest.',
  'Einen Tag ohne Zucker.',
  'Handy für den ganzen Tag auf Flugmodus, außer für Notfälle.',
  '10 km laufen, unabhängig vom Wetter.',
  'Einen Fehler von heute laut vor jemandem zugeben.',
  'Ein kaltes Duschen + 5 Minuten Atemübung direkt danach.',
  'Rucksackmarsch mit Zusatzgewicht (mind. 10 kg) über 8 km.',
  'Einen ungeliebten Task zuerst erledigen, bevor irgendetwas anderes.',
  'Zimmer/Ausrüstung so aufräumen, als käme eine Inspektion.',
  'Einen Tag komplett ohne Beschweren – jede negative Aussage laut korrigieren.',
  '3x 1 Minute Plank, mit möglichst wenig Pause dazwischen.',
  'Wecker 30 Minuten früher stellen und die Zeit für Mobility nutzen.',
  'Einen Abend ohne Bildschirm, stattdessen Ausrüstung checken/pflegen.',
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function challengeForDate(dateStr) {
  const index = hashString(dateStr) % CHALLENGE_POOL.length;
  return CHALLENGE_POOL[index];
}
