'use client';

import { useState } from 'react';
import type { QuizQuestion } from '@/lib/quiz';

export function Quiz({ questions }: { questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  if (!questions.length) return null;
  return <section className="quiz-panel" aria-labelledby="quiz-title"><span className="eyebrow">DEIN ENTDECKER-MOMENT</span><h2 id="quiz-title">Wie gut kennst du mich?</h2><p>Wähle eine Antwort. Du darfst es jederzeit noch einmal versuchen.</p>
    {questions.map((item, index) => <fieldset key={index}><legend>{index + 1}. {item.question}</legend><div className="quiz-options">{item.options.map(option => <button type="button" key={option} className={answers[index] === option ? 'selected' : ''} aria-pressed={answers[index] === option} onClick={() => setAnswers({ ...answers, [index]: option })}>{option}</button>)}</div><div aria-live="polite" className="quiz-feedback">{answers[index] ? answers[index] === item.correct ? 'Richtig! Das hast du gut entdeckt.' : 'Noch nicht ganz. Schau noch einmal im Steckbrief nach und probiere es erneut.' : ' '}</div></fieldset>)}
    {Object.keys(answers).length === questions.length && <button className="button secondary" onClick={() => setAnswers({})}>Noch einmal spielen ↺</button>}
  </section>;
}
