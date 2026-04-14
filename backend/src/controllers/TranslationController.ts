import { Request, Response } from "express";
import Language from "../models/Language";
import Translation from "../models/Translation";
import AppError from "../errors/AppError";
import { Op } from "sequelize";

// ==================== LANGUAGES ====================

export const listLanguages = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const languages = await Language.findAll({
    order: [["name", "ASC"]]
  });
  return res.status(200).json(languages);
};

export const createLanguage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  if (companyId !== 1) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { code, name } = req.body;

  if (!code || !name) {
    throw new AppError("ERR_MISSING_PARAMS", 400);
  }

  const existing = await Language.findOne({ where: { code } });
  if (existing) {
    throw new AppError("ERR_LANGUAGE_ALREADY_EXISTS", 400);
  }

  const language = await Language.create({ code, name, active: true });
  return res.status(201).json(language);
};

export const updateLanguage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  if (companyId !== 1) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { id } = req.params;
  const { name, active } = req.body;

  const language = await Language.findByPk(id);
  if (!language) {
    throw new AppError("ERR_LANGUAGE_NOT_FOUND", 404);
  }

  if (name !== undefined) language.name = name;
  if (active !== undefined) language.active = active;
  await language.save();

  return res.status(200).json(language);
};

export const deleteLanguage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  if (companyId !== 1) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { id } = req.params;

  const language = await Language.findByPk(id);
  if (!language) {
    throw new AppError("ERR_LANGUAGE_NOT_FOUND", 404);
  }

  // Delete all translations for this language
  await Translation.destroy({ where: { languageCode: language.code } });
  await language.destroy();

  return res.status(200).json({ message: "Language deleted" });
};

// ==================== TRANSLATIONS ====================

export const listAllTranslations = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const translations = await Translation.findAll();
  const languages = await Language.findAll({ where: { active: true } });

  // Group translations by language code
  const grouped: Record<string, Record<string, string>> = {};
  for (const t of translations) {
    if (!grouped[t.languageCode]) {
      grouped[t.languageCode] = {};
    }
    grouped[t.languageCode][t.key] = t.value;
  }

  return res.status(200).json({ translations: grouped, languages });
};

export const getTranslationsByLanguage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { language } = req.params;

  const translations = await Translation.findAll({
    where: { languageCode: language }
  });

  const result: Record<string, string> = {};
  for (const t of translations) {
    result[t.key] = t.value;
  }

  return res.status(200).json(result);
};

export const saveTranslations = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  if (companyId !== 1) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { language } = req.params;
  const { translations } = req.body; // { key: value, key: value, ... }

  if (!translations || typeof translations !== "object") {
    throw new AppError("ERR_INVALID_DATA", 400);
  }

  const keys = Object.keys(translations);

  for (const key of keys) {
    const value = translations[key];
    if (value === null || value === undefined || value === "") {
      // Delete translation if empty
      await Translation.destroy({
        where: { languageCode: language, key }
      });
    } else {
      const existing = await Translation.findOne({
        where: { languageCode: language, key }
      });
      if (existing) {
        existing.value = value;
        await existing.save();
      } else {
        await Translation.create({
          languageCode: language,
          key,
          value
        });
      }
    }
  }

  return res.status(200).json({ message: "Translations saved" });
};

export const exportTranslations = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { language } = req.params;

  const translations = await Translation.findAll({
    where: { languageCode: language }
  });

  const result: Record<string, string> = {};
  for (const t of translations) {
    result[t.key] = t.value;
  }

  const lang = await Language.findOne({ where: { code: language } });

  return res.status(200).json({
    language: language,
    name: lang?.name || language,
    translations: result
  });
};

export const importTranslations = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  if (companyId !== 1) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { language } = req.params;
  const { translations } = req.body; // { key: value, ... }

  if (!translations || typeof translations !== "object") {
    throw new AppError("ERR_INVALID_DATA", 400);
  }

  const keys = Object.keys(translations);
  let imported = 0;

  for (const key of keys) {
    const value = translations[key];
    if (!value) continue;

    const existing = await Translation.findOne({
      where: { languageCode: language, key }
    });
    if (existing) {
      existing.value = value;
      await existing.save();
    } else {
      await Translation.create({
        languageCode: language,
        key,
        value
      });
    }
    imported++;
  }

  return res.status(200).json({ message: `${imported} translations imported` });
};

// ==================== AUTO TRANSLATE (MyMemory API - Free) ====================

const mapLanguageCode = (code: string): string => {
  const map: Record<string, string> = {
    "pt-BR": "pt",
    "pt": "pt",
    "en": "en",
    "es": "es",
    "fr": "fr",
    "de": "de",
    "it": "it",
    "ja": "ja",
    "ko": "ko",
    "zh": "zh",
    "ru": "ru",
    "ar": "ar",
    "hi": "hi",
    "nl": "nl",
    "tr": "tr",
    "pl": "pl",
  };
  return map[code] || code;
};

const translateText = async (
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> => {
  try {
    const langPair = `${sourceLang}|${targetLang}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langPair)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Accept": "application/json" }
    });

    if (!response.ok) {
      throw new Error(`MyMemory error: ${response.status}`);
    }

    const data = await response.json();

    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText;
    }

    return text;
  } catch (err) {
    console.error("[AutoTranslate] Error translating:", err);
    return text;
  }
};

export const autoTranslate = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { companyId } = req.user;
    if (companyId !== 1) {
      throw new AppError("ERR_NO_PERMISSION", 403);
    }

    const { language } = req.params;
    const { keys, sourceLanguage = "pt-BR", overwrite = false } = req.body;

    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      throw new AppError("ERR_INVALID_DATA", 400);
    }

    const sourceLang = mapLanguageCode(sourceLanguage);
    const targetLang = mapLanguageCode(language);

    if (sourceLang === targetLang) {
      throw new AppError("ERR_SAME_LANGUAGE", 400);
    }

    let translated = 0;
    let skipped = 0;
    const results: Record<string, string> = {};

    for (const item of keys) {
      const { key, sourceText } = item;
      if (!key || !sourceText) continue;

      // Se não for sobrescrever, pula chaves que já têm tradução
      if (!overwrite) {
        const existing = await Translation.findOne({
          where: { languageCode: language, key }
        });
        if (existing && existing.value) {
          skipped++;
          results[key] = existing.value;
          continue;
        }
      }

      const translatedText = await translateText(sourceText, sourceLang, targetLang);

      const existing = await Translation.findOne({
        where: { languageCode: language, key }
      });
      if (existing) {
        existing.value = translatedText;
        await existing.save();
      } else {
        await Translation.create({
          languageCode: language,
          key,
          value: translatedText
        });
      }

      results[key] = translatedText;
      translated++;

      // Delay para evitar rate limiting (MyMemory: ~10 req/s free)
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    return res.status(200).json({
      message: `${translated} traduzidas, ${skipped} ignoradas`,
      translated,
      skipped,
      results
    });
  } catch (err) {
    console.error("[AutoTranslate] Unhandled error:", err);
    if (err instanceof AppError) {
      throw err;
    }
    return res.status(500).json({ error: "Erro na tradução automática" });
  }
};
