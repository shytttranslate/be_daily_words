import { langs } from '@google/constants/index';

export const getLangCodeFromStandard = (standard: string) => {
  const langCode = Object.keys(langs).find((key) => langs[key].toLowercase() === standard.toLowerCase());
  return langCode;
};
