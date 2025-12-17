const fetch = require('node-fetch');
const {
  conceptExplainPrompt,
  questionAnswerPrompt,
} = require('../utils/prompts');

// Helper function to call ApiFreeLLM
async function generateFromFreeAI(prompt) {
  const response = await fetch('https://apifreellm.com/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: prompt }),
  });
  const data = await response.json();

  if (!data || !data.response) throw new Error('AI response is empty');

  return data.response;
}

// @desc Generate interview questions and answers
// @route POST /api/ai/generate-questions
// @access Private
const generateInterviewQuestions = async (req, res) => {
  try {
    const { role, experience, topicsToFocus, numberOfQuestions } = req.body;

    if (!role || !experience || !topicsToFocus || !numberOfQuestions) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const prompt = questionAnswerPrompt(
      role,
      experience,
      topicsToFocus,
      numberOfQuestions
    );

    const rawText = await generateFromFreeAI(prompt);

    let data;
    try {
      const cleanedText = rawText
        .replace(/^```json\s*/, '')
        .replace(/```$/, '')
        .trim();
      data = JSON.parse(cleanedText);
    } catch (err) {
      data = { raw: rawText };
    }

    res.status(200).json(data);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to generate questions', error: error.message });
  }
};

// @desc Generate explanation for a question
// @route POST /api/ai/generate-explanation
// @access Private
const generateConceptExplanation = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const prompt = conceptExplainPrompt(question);
    const rawText = await generateFromFreeAI(prompt);

    if (!rawText) {
      return res.status(200).json({ title: '', explanation: '', raw: '' });
    }

    let data;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      data = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: rawText };
    } catch (err) {
      data = { raw: rawText };
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to generate explanations',
      error: error.message,
    });
  }
};

module.exports = { generateInterviewQuestions, generateConceptExplanation };
