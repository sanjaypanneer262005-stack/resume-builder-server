import { generateContent } from '../config/gemini.config.js';
import * as prompts from '../constants/prompts.js';

const parseJsonResponse = (text) => {
  try { return JSON.parse(text); } catch (e) { /* continue */ }

  let jsonStr = null;
  if (text.includes('```json')) {
    const start = text.indexOf('```json') + 7;
    const end = text.indexOf('```', start);
    if (end > start) jsonStr = text.slice(start, end).trim();
  } else if (text.includes('```')) {
    const start = text.indexOf('```') + 3;
    const end = text.indexOf('```', start);
    if (end > start) jsonStr = text.slice(start, end).trim();
  } else if (text.includes('{')) {
    const start = text.indexOf('{');
    let depth = 0;
    for (let i = start; i < text.length; i++) {
      if (text[i] === '{') depth++;
      else if (text[i] === '}') { depth--; if (depth === 0) { jsonStr = text.slice(start, i + 1); break; } }
    }
  }

  if (jsonStr) {
    try { return JSON.parse(jsonStr); } catch (e) { /* continue */ }
  }

  return { error: 'Failed to parse AI response', raw: text };
};

export const parseResume = async (data) => {
  const prompt = prompts.resumeParserPrompt(data.resumeText || '');
  const result = await generateContent(prompt);
  return parseJsonResponse(result);
};