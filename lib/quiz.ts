import sanitize from 'sanitize-html';
import type { ContentBlock } from './types';

export interface QuizQuestion { question: string; correct: string; options: string[]; }
export function extractQuiz(blocks: ContentBlock[]): QuizQuestion[] {
  const text = blocks.map(block => sanitize((block.html || block.content || '').replace(/<br\s*\/?\s*>/gi, '\n'), { allowedTags: [], allowedAttributes: {} })).join('\n');
  const segments = text.split(/Frage\s*\d+/i).slice(1);
  return segments.flatMap((segment, index) => {
    const question = segment.match(/([^?]+\?)/)?.[1].trim();
    const correct = segment.match(/Richtige Antwort:\s*([^\n❌]+?)(?=\n|❌|Falsche Antworten:|$)/i)?.[1].trim();
    const wrong = segment.split(/Falsche Antworten:/i)[1]?.split(/\n/).map(answer => answer.replace(/^[\s•❌-]+/, '').trim()).filter(Boolean).slice(0, 2) || [];
    if (!question || !correct || wrong.length < 2) return [];
    const options = [...wrong];
    options.splice(index % 3, 0, correct);
    return [{ question, correct, options }];
  });
}
