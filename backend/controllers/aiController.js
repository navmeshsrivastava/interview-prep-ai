const Groq = require('groq-sdk');
const {
  conceptExplainPrompt,
  questionAnswerPrompt,
} = require('../utils/prompts');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Generate Interview Questions
const generateInterviewQuestions = async (req, res) => {
  try {
    const { role, experience, topicsToFocus, numberOfQuestions, description } =
      req.body;

    if (
      !role ||
      !experience ||
      !topicsToFocus ||
      !numberOfQuestions ||
      !description
    ) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const prompt = questionAnswerPrompt(
      role,
      experience,
      topicsToFocus,
      numberOfQuestions,
      description
    );

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
    });

    const rawText = response.choices[0]?.message?.content;

    if (!rawText) {
      throw new Error('AI response is empty');
    }

    let questions;

    try {
      const cleaned = rawText
        .replace(/^```json\s*/, '')
        .replace(/```$/, '')
        .trim();

      questions = JSON.parse(cleaned);

      if (!Array.isArray(questions)) {
        throw new Error('AI did not return an array');
      }
    } catch (err) {
      return res.status(500).json({
        message: 'AI returned invalid JSON format',
      });
    }

    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to generate questions',
      error: error.message,
    });
  }
};

// Generate Concept Explanation
const generateConceptExplanation = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const prompt = conceptExplainPrompt(question);

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
    });

    const rawText = response.choices[0]?.message?.content;

    if (!rawText) {
      throw new Error('AI response is empty');
    }

    let data;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      data = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: rawText };
    } catch {
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

module.exports = {
  generateInterviewQuestions,
  generateConceptExplanation,
};
