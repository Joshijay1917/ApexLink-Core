import { GoogleGenAI } from '@google/genai';

export const translateText = async (text: string, targetLang: string = 'en'): Promise<string> => {
  try {
    const ai = new GoogleGenAI({});
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Translate the following text to ${targetLang}. Only return the translated text without any extra explanation or formatting. Text: "${text}"`,
    });
    return response.text || text;
  } catch (err) {
    console.warn('Gemini translation error, falling back to Google Translate API...');
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
      const response = await fetch(url)
      const res = await response.json();
      console.log("translated:", res[0][0][0])
      if (res && res[0] && res[0][0] && res[0][0][0]) {
        return res[0][0][0];
      }
      return text;
    } catch (fallbackErr) {
      console.error('Fallback Google translation also failed:', fallbackErr);
      return text; // Ultimate fallback to original
    }
  }
};
