// Opcje ankiety „Skąd o nas wiesz?". Dodanie kolejnej opcji do dowolnego
// poziomu to jedna linijka tutaj — nic więcej (popup, zapis do bazy i panel
// /admin czytają tę listę).
//
// `subQuestion`/`subOptions` na opcji oznacza, że po jej wybraniu popup
// dopytuje jeszcze o doprecyzowanie (patrz "Media społecznościowe" niżej).
// `value: OTHER_VALUE` na dowolnym poziomie odblokowuje opcjonalne pole
// tekstowe "dopisz skąd" w popupie.
export type SurveyOption = {
  value: string;
  label: string;
  subQuestion?: string;
  subOptions?: SurveyOption[];
};

export const OTHER_VALUE = "other";

export const SURVEY_QUESTION = "Skąd się o nas dowiedziałeś?";

export const SOCIAL_MEDIA_QUESTION = "Z jakiego medium społecznościowego?";

export const SOCIAL_MEDIA_OPTIONS: SurveyOption[] = [
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: OTHER_VALUE, label: "Inne" },
];

export const SURVEY_OPTIONS: SurveyOption[] = [
  {
    value: "social_media",
    label: "Media społecznościowe",
    subQuestion: SOCIAL_MEDIA_QUESTION,
    subOptions: SOCIAL_MEDIA_OPTIONS,
  },
  { value: "friend", label: "Od znajomego" },
  { value: "flyer", label: "Z ulotki" },
  { value: OTHER_VALUE, label: "Inne" },
];

export function surveyOptionLabel(value: string): string {
  return SURVEY_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function socialMediaOptionLabel(value: string): string {
  return SOCIAL_MEDIA_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
