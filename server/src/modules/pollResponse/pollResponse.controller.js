import Response from './pollResponse.model.js';
import Poll from '../polls/polls.model.js';

//Submit poll response
async function submitResponse(req, res) {
    try {
        const { shareCode, answers } = req.body;

        if (!shareCode || !answers || !Array.isArray(answers)) {
        return res.status(400).json({ message: 'Share code and answers are required' });
        }

        const poll = await Poll.findOne({ shareCode });
        if (!poll) return res.status(404).json({ message: 'Poll not found' });

        // Check if poll is accepting responses
        if (!poll.isActive) {
        return res.status(400).json({ message: 'This poll is no longer active' });
        }
        if (poll.expiresAt && new Date() > poll.expiresAt) {
        return res.status(400).json({ message: 'This poll has expired' });
        }
        if (poll.isPublished) {
        return res.status(400).json({ message: 'This poll is closed' });
        }

        // Check if auth required
        if (poll.requiresAuth && !req.user) {
        return res.status(401).json({ message: 'You must be logged in to respond to this poll' });
        }

        // Check for duplicate response (authenticated users)
        if (req.user) {
        const existing = await Response.findOne({ poll: poll._id, respondent: req.user._id });
        if (existing) {
            return res.status(400).json({ message: 'You have already responded to this poll' });
        }
        }

        // Validate mandatory questions
        const mandatoryQuestions = poll.questions.filter(q => q.isMandatory);
        for (let q of mandatoryQuestions) {
        const hasAnswer = answers.find(a => a.questionId === q._id.toString());
        if (!hasAnswer) {
            return res.status(400).json({ message: `Question "${q.text}" is mandatory` });
        }
        }

        // Validate answer option indices
        for (let answer of answers) {
        const question = poll.questions.id(answer.questionId);
        if (!question) {
            return res.status(400).json({ message: 'Invalid question ID' });
        }
        if (answer.selectedOptionIndex < 0 || answer.selectedOptionIndex >= question.options.length) {
            return res.status(400).json({ message: 'Invalid option selected' });
        }
        }

        // Save response
        const response = await Response.create({
        poll: poll._id,
        respondent: poll.isAnonymous ? null : (req.user?._id || null),
        answers: answers.map(a => ({
            questionId: a.questionId,
            selectedOptionIndex: a.selectedOptionIndex
        })),
        ipAddress: req.ip
        });

        // Update option counts on the poll
        for (let answer of answers) {
        const question = poll.questions.id(answer.questionId);
        if (question) {
            question.options[answer.selectedOptionIndex].count += 1;
        }
        }
        poll.totalResponses += 1;
        await poll.save();

        // Emit real-time update via Socket.io
        const io = req.app.get('io');
        io.to(`poll-${poll._id}`).emit('new-response', {
        pollId: poll._id,
        totalResponses: poll.totalResponses,
        questions: poll.questions.map(q => ({
            _id: q._id,
            options: q.options.map(o => ({ _id: o._id, count: o.count }))
        }))
        });

        res.status(201).json({ message: 'Response submitted successfully', responseId: response._id });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export default {
    submitResponse
}
