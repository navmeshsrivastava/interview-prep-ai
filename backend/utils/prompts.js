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
    - For each question, generate a detailed answer according to  ${experience} year experience.
    - Must have code snippet if question demands or if required in explanation or the the role is IT sector related.
    - If you include code, ALWAYS wrap it in markdown code blocks using triple backticks and specify the language.
     Example:
      \`\`\`js
      const express = require('express');
      \`\`\`
    - Keep formatting very clean.

    Strictly return a pure JSON array like:
    [
        {
            "question": "Question here?",
            "answer": "Answer here."
        },
        ...
    ]

    Strict note & Condition you must follow everytime: Do not add markdown or explanations or anything extra. Only return array of valid JSON. Code Snippets (if present) also must follow the above given instructions for them.
`;

const conceptExplainPrompt = (question) =>
  `
You are an AI that explains technical interview questions.

Task:
- Explain the question: "${question}" clearly for beginners.
- Provide a short title summarizing the concept.
- Must have code snippet if question demands or if required in explanation or the the role is IT sector related.
- If you include code, ALWAYS wrap it in markdown code blocks using triple backticks and specify the language.
     Example:
      \`\`\`js
      const express = require('express');
      \`\`\`
- Keep formatting very clean.

Return a JSON object like:
{
  "title": "Short title",
  "explanation": "Detailed explanation here."
}

Strict note & Condition you must follow everytime: Return ONLY valid JSON. Do not add markdown or explanations or anything extra. Code Snippets (if present) also must follow the above given instructions for them.
`;

module.exports = { questionAnswerPrompt, conceptExplainPrompt };
