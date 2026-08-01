// Opcje ankiety „Skąd o nas wiesz?". Dodanie kolejnej opcji to jedna linijka
// tutaj — nic więcej (popup, zapis do bazy i panel /admin czytają tę listę).
export type SurveyOption = {
  value: string;
  label: string;
};

export const SURVEY_QUESTION = "Skąd się o nas dowiedziałeś?";

export const SURVEY_OPTIONS: SurveyOption[] = [
  { value: "social_media", label: "Media społecznościowe" },
  { value: "friend", label: "Od znajomego" },
  { value: "flyer", label: "Z ulotki" },
];

export function surveyOptionLabel(value: string): string {
  return SURVEY_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
