const Session = require('../models/Session');
const Question = require('../models/Question');

// @desc    Create a new session and linked questions
// @route   POST /api/sessions/create
// @access  Private
const createSession = async (req, res) => {
  try {
    const { role, experience, topicsToFocus, description, questions } =
      req.body;
    const userId = req.user._id;

    const session = await Session.create({
      user: userId,
      role,
      experience,
      topicsToFocus,
      description,
    });

    const questionDocs = await Promise.all(
      questions.map(async (q) => {
        const question = await Question.create({
          session: session._id,
          question: q.question,
          answer: q.answer,
        });
        return question._id;
      })
    );
    session.questions = questionDocs;
    await session.save();

    res.status(201).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all the sessions for the logged in users
// @route   GET /api/sessions/my-sessions
// @access  Private
const getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('questions');
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get a session by id with popuplated questions
// @route   GET /api/sessions/:id
// @access  Private
const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate({
        path: 'questions',
        options: { sort: { isPinned: -1, creditAt: -1 } },
      })
      .exec();

    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: 'Session not found' });
    }

    res.status(200).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete a session and its questions
// @routes  DELETE /api/sessions/:id
// @access  Private
const deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: 'Not authorized to delete this session' });
    }

    // First delete all the questions linked to that text
    await Question.deleteMany({ session: session._id });

    // Thus, delete the session
    await session.deleteOne();

    res.status(200).json({ message: 'Session deleted successfully ' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createSession,
  getMySessions,
  getSessionById,
  deleteSession,
};
