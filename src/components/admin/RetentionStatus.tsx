"use client";

import { useEffect, useState } from "react";

type RetentionRun = {
  run_at: string;
  cutoff: string;
  survey_anonymized: number;
  visits_anonymized: number;
  submissions_deleted: number;
  referrals_deleted: number;
  error: string | null;
};

// Widoczny dowod, ze obietnica "24 miesiace retencji" z polityki prywatnosci
// jest faktycznie egzekwowana (patrz src/lib/retention.ts) - bez zagladania
// recznie do bazy. Sprzatanie wyzwala sie samo przy zapisach, ten widok
// tylko odczytuje ostatni wpis w retention_runs.
export function RetentionStatus({ token }: { token: string }) {
  const [run, setRun] = useState<RetentionRun | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/retention-status", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setRun(data.lastRun ?? null);
      })
      .catch(() => {
        if (!cancelled) setRun(null);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (run === undefined) return null;

  return (
    <div className="mb-8 rounded-2xl border border-sr-line bg-white px-5 py-4 text-xs text-[#3D4D65] flex flex-wrap items-center gap-x-6 gap-y-2">
      <span className="font-bold uppercase tracking-widest text-sr-red shrink-0">
        Czyszczenie danych (24 mies.)
      </span>
      {run === null ? (
        <span>Jeszcze nie uruchomione — odpali się samo przy pierwszym zapisie ankiety lub wejściu.</span>
      ) : run.error ? (
        <span className="text-sr-red">
          Ostatnia próba {new Date(run.run_at).toLocaleString("pl-PL")} zakończona błędem — sprawdź logi Railway.
        </span>
      ) : (
        <>
          <span>Ostatni przebieg: {new Date(run.run_at).toLocaleString("pl-PL")}</span>
          <span>Zanonimizowane ankiety: {run.survey_anonymized}</span>
          <span>Zanonimizowane wizyty: {run.visits_anonymized}</span>
          <span>Usunięte zgłoszenia: {run.submissions_deleted}</span>
          <span>Usunięte zaproszenia: {run.referrals_deleted ?? 0}</span>
        </>
      )}
    </div>
  );
}

export default RetentionStatus;
