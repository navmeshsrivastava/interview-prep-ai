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

    if (!role || !experience || !topicsToFocus || !numberOfQuestions) {
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
      messages: [
        {
          role: 'system',
          content:
            'You are a JSON-only API. Return ONLY a valid JSON array. No markdown, no text, no explanations.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
    });

    const rawText = response.choices[0]?.message?.content.trim();

    if (!rawText) {
      throw new Error('AI response is empty');
    }

    const questions = JSON.parse(rawText);

    if (!Array.isArray(questions)) {
      throw new Error('AI did not return an array');
    }

    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({
      message: 'AI returned invalid JSON format',
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
      messages: [
        {
          role: 'system',
          content:
            'You are a JSON-only API. You must return ONLY valid JSON. No markdown, no text, no code fences.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
    });
    const rawText = response.choices[0]?.message?.content?.trim();
    if (!rawText) {
      throw new Error('AI response is empty');
    }
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (err) {
      console.error('Invalid JSON from AI:', rawText);
      return res.status(500).json({ message: 'AI returned invalid JSON..' });
    }
    if (!data.title || !data.explanation) {
      return res
        .status(500)
        .json({ message: 'AI response missing required fields' });
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
