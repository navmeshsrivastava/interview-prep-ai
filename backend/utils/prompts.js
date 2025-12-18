const questionAnswerPrompt = (
  role,
  experience,
  topicsToFocus,
  numberOfQuestions,
  description
) =>
  `
    You are an AI trained to generate technical interview questions and answers.
    
    Task:
    - Role: ${role}
    - Candidate Experience: ${experience} years
    - Focus Topics: ${topicsToFocus}
    ${
      description
        ? `- Additional Context from the candidate: ${description}`
        : ''
    }
    - Write ${numberOfQuestions} interview questions.
    - For each question, generate a detailed but beginner-friendly answer.
    - If the answer needs a code example, add a small code inside.
    - Keep formatting very clean.
    - Return a pure JSON array like:
    [
        {
            "question": "Question here?",
            "answer": "Answer here."
        },
        ...
    ]

    Important: Do NOT add any extra text. Only return valid JSON.
`;

const conceptExplainPrompt = (question) =>
  `
You are an AI that explains technical interview questions.

Task:
- Explain the question: "${question}" clearly for beginners.
- Provide a short title summarizing the concept.
- Include a small code example if needed.

Return a JSON object like:
{
  "title": "Short title",
  "explanation": "Detailed explanation here."
}
`;

module.exports = { questionAnswerPrompt, conceptExplainPrompt };
