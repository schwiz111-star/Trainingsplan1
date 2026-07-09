import { useMemo, useState } from 'react';
import { loadState, saveState } from '../lib/storage.js';
import { todayStr } from '../lib/date.js';
import { ACTIVITY_LEVELS, DEFICIT_LEVELS, bmr, tdee, tourKcal } from '../lib/calories.js';

const PROFILE_KEY = 'profile';

function defaultProfile() {
  return {
    weightKg: '',
    heightCm: '',
    age: '',
    gender: 'male',
    activityLevel: 'sedentary',
    deficitLevel: 'moderate',
  };
}

export default function Calories() {
  const [profile, setProfile] = useState(() => ({
    ...defaultProfile(),
    ...loadState(PROFILE_KEY, {}),
  }));
  const tours = useMemo(() => loadState('tours', []), []);
  const today = todayStr();

  function updateField(field, value) {
    const next = { ...profile, [field]: value };
    setProfile(next);
    saveState(PROFILE_KEY, next);
  }

  const weightKg = Number(profile.weightKg);
  const heightCm = Number(profile.heightCm);
  const age = Number(profile.age);
  const profileComplete = weightKg > 0 && heightCm > 0 && age > 0;

  const todayTours = tours.filter((t) => t.date === today);

  let bmrValue = 0;
  let tdeeValue = 0;
  let deficitKcal = 0;
  let sportKcal = 0;
  let targetKcal = 0;

  if (profileComplete) {
    bmrValue = bmr({ weightKg, heightCm, age, gender: profile.gender });
    tdeeValue = tdee(bmrValue, profile.activityLevel);
    deficitKcal = DEFICIT_LEVELS.find((d) => d.id === profile.deficitLevel)?.kcal ?? 0;
    sportKcal = todayTours.reduce((sum, t) => sum + tourKcal(t, weightKg), 0);
    targetKcal = Math.round(tdeeValue - deficitKcal + sportKcal);
  }

  return (
    <div className="app-main">
      <section className="card">
        <p className="section-title">Profil</p>
        <div className="tour-form">
          <div className="field">
            <label htmlFor="cal-weight">Gewicht (kg)</label>
            <input
              id="cal-weight"
              value={profile.weightKg}
              onChange={(e) => updateField('weightKg', e.target.value)}
              placeholder="80"
              inputMode="decimal"
            />
          </div>
          <div className="field">
            <label htmlFor="cal-height">Größe (cm)</label>
            <input
              id="cal-height"
              value={profile.heightCm}
              onChange={(e) => updateField('heightCm', e.target.value)}
              placeholder="180"
              inputMode="decimal"
            />
          </div>
          <div className="field">
            <label htmlFor="cal-age">Alter</label>
            <input
              id="cal-age"
              value={profile.age}
              onChange={(e) => updateField('age', e.target.value)}
              placeholder="25"
              inputMode="numeric"
            />
          </div>
          <div className="field">
            <label htmlFor="cal-gender">Geschlecht</label>
            <select
              id="cal-gender"
              value={profile.gender}
              onChange={(e) => updateField('gender', e.target.value)}
            >
              <option value="male">Männlich</option>
              <option value="female">Weiblich</option>
              <option value="other">Divers</option>
            </select>
          </div>
          <div className="field tour-form-notes">
            <label htmlFor="cal-activity">Alltagsaktivität (ohne Sport)</label>
            <select
              id="cal-activity"
              value={profile.activityLevel}
              onChange={(e) => updateField('activityLevel', e.target.value)}
            >
              {ACTIVITY_LEVELS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="card">
        <p className="section-title">Ziel</p>
        <div className="field">
          <label htmlFor="cal-deficit">Abnehmtempo</label>
          <select
            id="cal-deficit"
            value={profile.deficitLevel}
            onChange={(e) => updateField('deficitLevel', e.target.value)}
          >
            {DEFICIT_LEVELS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="card">
        <p className="section-title">Kalorienziel heute</p>

        {!profileComplete && (
          <p className="empty-state">
            Trag oben Gewicht, Größe und Alter ein, dann berechne ich dein Kalorienziel.
          </p>
        )}

        {profileComplete && (
          <>
            <div className="kcal-breakdown">
              <div className="kcal-row">
                <span>Grundumsatz (BMR)</span>
                <span>{Math.round(bmrValue)} kcal</span>
              </div>
              <div className="kcal-row">
                <span>Tagesbedarf, ohne Sport (TDEE)</span>
                <span>{Math.round(tdeeValue)} kcal</span>
              </div>
              <div className="kcal-row">
                <span>Ziel-Defizit</span>
                <span>−{deficitKcal} kcal</span>
              </div>
              <div className="kcal-row">
                <span>
                  Sport heute
                  {todayTours.length > 0 &&
                    ` (${todayTours.length} Einheit${todayTours.length === 1 ? '' : 'en'})`}
                </span>
                <span>+{sportKcal} kcal</span>
              </div>
            </div>

            <div className="kcal-target">
              <span className="kcal-target-label">Kalorienziel heute</span>
              <span className="kcal-target-value">{targetKcal} kcal</span>
            </div>

            {todayTours.length > 0 && (
              <div className="kcal-tours">
                {todayTours.map((t) => (
                  <div key={t.id} className="kcal-tour-row">
                    <span>
                      {t.type} · {t.durationMin} min
                    </span>
                    <span>+{tourKcal(t, weightKg)} kcal</span>
                  </div>
                ))}
              </div>
            )}

            <p className="kcal-note">
              Schätzung auf Basis von Mifflin-St-Jeor-Formel und groben MET-Werten pro
              Trainingsart – zur Orientierung, kein medizinischer Wert.
            </p>
          </>
        )}
      </section>
    </div>
  );
}
