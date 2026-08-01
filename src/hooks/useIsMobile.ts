"use client";

import { useEffect, useState } from "react";

const QUERY = "(max-width: 767px)";

/**
 * true na wąskich ekranach / dotyku. Zwraca false podczas SSR i pierwszego
 * renderu klienta (unikamy niezgodności hydratacji), a potem dogania się przez
 * efekt — komponenty korzystające z tego hooka do warunkowego ładowania
 * ciężkich bibliotek muszą się z tym liczyć (krótki błysk "pełnej" wersji przy
 * pierwszym renderze jest tańszy niż ryzykowanie mismatchu SSR/klient).
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return isMobile;
}

export default useIsMobile;
