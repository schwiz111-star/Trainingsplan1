import { useState } from 'react';
import { loadState, saveState, uid } from '../lib/storage.js';

const STORAGE_KEY = 'plans';

function emptyExercise() {
  return { id: uid(), name: '', sets: '', reps: '', weight: '', notes: '' };
}

export default function TrainingPlans() {
  const [plans, setPlans] = useState(() => loadState(STORAGE_KEY, []));
  const [activePlanId, setActivePlanId] = useState(plans[0]?.id ?? null);
  const [newPlanName, setNewPlanName] = useState('');

  function persist(next) {
    setPlans(next);
    saveState(STORAGE_KEY, next);
  }

  function addPlan() {
    const name = newPlanName.trim();
    if (!name) return;
    const plan = { id: uid(), name, exercises: [] };
    const next = [...plans, plan];
    persist(next);
    setActivePlanId(plan.id);
    setNewPlanName('');
  }

  function deletePlan(planId) {
    const next = plans.filter((p) => p.id !== planId);
    persist(next);
    if (activePlanId === planId) {
      setActivePlanId(next[0]?.id ?? null);
    }
  }

  function updatePlan(planId, updater) {
    const next = plans.map((p) => (p.id === planId ? updater(p) : p));
    persist(next);
  }

  function addExercise(planId) {
    updatePlan(planId, (p) => ({
      ...p,
      exercises: [...p.exercises, emptyExercise()],
    }));
  }

  function updateExercise(planId, exerciseId, field, value) {
    updatePlan(planId, (p) => ({
      ...p,
      exercises: p.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, [field]: value } : ex
      ),
    }));
  }

  function deleteExercise(planId, exerciseId) {
    updatePlan(planId, (p) => ({
      ...p,
      exercises: p.exercises.filter((ex) => ex.id !== exerciseId),
    }));
  }

  const activePlan = plans.find((p) => p.id === activePlanId) ?? null;

  return (
    <div className="app-main">
      <section className="card">
        <p className="section-title">Neuer Plan</p>
        <div className="row">
          <div className="field">
            <label htmlFor="plan-name">Name</label>
            <input
              id="plan-name"
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPlan()}
              placeholder="z.B. Kraft Grundlage"
            />
          </div>
          <button type="button" className="btn btn-primary" onClick={addPlan}>
            Plan anlegen
          </button>
        </div>
      </section>

      {plans.length === 0 && (
        <p className="empty-state">
          Noch kein Trainingsplan vorhanden. Leg oben deinen ersten Plan an.
        </p>
      )}

      {plans.length > 0 && (
        <section className="card">
          <p className="section-title">Pläne</p>
          <div className="plan-tabs">
            {plans.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`plan-chip ${p.id === activePlanId ? 'plan-chip--active' : ''}`}
                onClick={() => setActivePlanId(p.id)}
              >
                {p.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {activePlan && (
        <section className="card">
          <div className="plan-header">
            <h2>{activePlan.name}</h2>
            <button
              type="button"
              className="btn btn-danger btn-icon"
              onClick={() => deletePlan(activePlan.id)}
            >
              Plan löschen
            </button>
          </div>

          {activePlan.exercises.length === 0 && (
            <p className="empty-state">Noch keine Übungen in diesem Plan.</p>
          )}

          {activePlan.exercises.length > 0 && (
            <div className="exercise-table">
              <div className="exercise-row exercise-row--head">
                <span>Übung</span>
                <span>Sätze</span>
                <span>Wdh.</span>
                <span>Gewicht (kg)</span>
                <span>Notizen</span>
                <span />
              </div>
              {activePlan.exercises.map((ex) => (
                <div className="exercise-row" key={ex.id}>
                  <input
                    value={ex.name}
                    onChange={(e) =>
                      updateExercise(activePlan.id, ex.id, 'name', e.target.value)
                    }
                    placeholder="Kniebeuge"
                  />
                  <input
                    value={ex.sets}
                    onChange={(e) =>
                      updateExercise(activePlan.id, ex.id, 'sets', e.target.value)
                    }
                    placeholder="4"
                    inputMode="numeric"
                  />
                  <input
                    value={ex.reps}
                    onChange={(e) =>
                      updateExercise(activePlan.id, ex.id, 'reps', e.target.value)
                    }
                    placeholder="8"
                    inputMode="numeric"
                  />
                  <input
                    value={ex.weight}
                    onChange={(e) =>
                      updateExercise(activePlan.id, ex.id, 'weight', e.target.value)
                    }
                    placeholder="60"
                    inputMode="decimal"
                  />
                  <input
                    value={ex.notes}
                    onChange={(e) =>
                      updateExercise(activePlan.id, ex.id, 'notes', e.target.value)
                    }
                    placeholder="optional"
                  />
                  <button
                    type="button"
                    className="btn btn-danger btn-icon"
                    onClick={() => deleteExercise(activePlan.id, ex.id)}
                    aria-label="Übung löschen"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            className="btn"
            style={{ marginTop: 12 }}
            onClick={() => addExercise(activePlan.id)}
          >
            + Übung hinzufügen
          </button>
        </section>
      )}
    </div>
  );
}
