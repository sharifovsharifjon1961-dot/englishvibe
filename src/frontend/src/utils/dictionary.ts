import type { CefrLevel } from "@/backend";
import { estimateWordLevel } from "@/utils/cefr";
import { normalizeWord } from "@/utils/text";

export interface DictionaryDefinition {
  partOfSpeech: string;
  definition: string;
  example?: string;
}

export interface DictionaryResult {
  word: string;
  phonetic?: string;
  audioUrl?: string;
  level?: CefrLevel;
  definitions: DictionaryDefinition[];
  synonyms: string[];
  examples: string[];
  source: "dictionaryapi" | "datamuse" | "none";
}

interface FreeDictionaryEntry {
  word?: string;
  phonetic?: string;
  phonetics?: Array<{ text?: string; audio?: string }>;
  meanings?: Array<{
    partOfSpeech?: string;
    definitions?: Array<{ definition?: string; example?: string }>;
    synonyms?: string[];
  }>;
}

interface DatamuseItem {
  word?: string;
  tags?: string[];
}

const DICTIONARY_API = "https://api.dictionaryapi.dev/api/v2/entries/en";
const DATAMUSE_API = "https://api.datamuse.com/words";

async function fetchDefinitions(
  word: string,
): Promise<DictionaryResult | null> {
  try {
    const response = await fetch(
      `${DICTIONARY_API}/${encodeURIComponent(word)}`,
    );
    if (!response.ok) return null;
    const payload = (await response.json()) as FreeDictionaryEntry[];
    const entry = payload[0];
    if (!entry) return null;

    const definitions: DictionaryDefinition[] = [];
    const synonyms = new Set<string>();
    const examples: string[] = [];

    for (const meaning of entry.meanings ?? []) {
      for (const def of meaning.definitions ?? []) {
        if (!def.definition) continue;
        definitions.push({
          partOfSpeech: meaning.partOfSpeech ?? "—",
          definition: def.definition,
          example: def.example,
        });
        if (def.example) examples.push(def.example);
      }
      for (const synonym of meaning.synonyms ?? []) synonyms.add(synonym);
    }

    const audio = entry.phonetics?.find((p) => p.audio)?.audio;
    const phonetic =
      entry.phonetic ?? entry.phonetics?.find((p) => p.text)?.text;

    return {
      word: entry.word ?? word,
      phonetic,
      audioUrl: audio,
      level: estimateWordLevel(word),
      definitions: definitions.slice(0, 6),
      synonyms: Array.from(synonyms).slice(0, 12),
      examples: examples.slice(0, 4),
      source: "dictionaryapi",
    };
  } catch {
    return null;
  }
}

async function fetchDatamuse(word: string): Promise<DictionaryResult | null> {
  try {
    const [synResponse, defResponse] = await Promise.all([
      fetch(`${DATAMUSE_API}?rel_syn=${encodeURIComponent(word)}&max=12`),
      fetch(`${DATAMUSE_API}?sp=${encodeURIComponent(word)}&md=d&max=1`),
    ]);
    const synonyms: string[] = [];
    if (synResponse.ok) {
      const items = (await synResponse.json()) as DatamuseItem[];
      for (const item of items) if (item.word) synonyms.push(item.word);
    }
    if (synonyms.length === 0 && !defResponse.ok) return null;

    return {
      word,
      level: estimateWordLevel(word),
      definitions: [],
      synonyms: synonyms.slice(0, 12),
      examples: [],
      source: "datamuse",
    };
  } catch {
    return null;
  }
}

/**
 * Single entry point for dictionary lookups. Queries the keyless Free
 * Dictionary API first, then falls back to Datamuse for synonyms. Returns
 * `null` when the word cannot be resolved.
 */
export async function lookupWord(
  rawWord: string,
): Promise<DictionaryResult | null> {
  const word = normalizeWord(rawWord);
  if (!word) return null;

  const primary = await fetchDefinitions(word);
  if (
    primary &&
    (primary.definitions.length > 0 || primary.synonyms.length > 0)
  ) {
    if (primary.synonyms.length === 0) {
      const fallback = await fetchDatamuse(word);
      if (fallback) primary.synonyms = fallback.synonyms;
    }
    return primary;
  }

  const fallback = await fetchDatamuse(word);
  if (fallback) return fallback;
  return primary;
}
