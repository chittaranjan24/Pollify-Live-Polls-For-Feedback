import Poll from './polls.model.js';
import Response from '../pollResponse/pollResponse.model.js';


//Create a poll (auth required)
async function createPolls(req, res) {
    try {
        const { title, description, questions, isAnonymous, requiresAuth, expiresAt } = req.body;

        if (!title || !questions || questions.length === 0) {
        return res.status(400).json({ message: 'Title and at least one question are required' });
        }

        // Validate questions
        for (let q of questions) {
        if (!q.text || !q.options || q.options.length < 2) {
            return res.status(400).json({ message: 'Each question needs text and at least 2 options' });
        }
        for (let opt of q.options) {
            if (!opt.text || !opt.text.trim()) {
            return res.status(400).json({ message: 'All option texts must be filled' });
            }
        }
        }

        const poll = await Poll.create({
        title,
        description,
        creator: req.user._id,
        questions,
        isAnonymous: isAnonymous !== undefined ? isAnonymous : true,
        requiresAuth: requiresAuth || false,
        expiresAt: expiresAt ? new Date(expiresAt) : null
        });

        res.status(201).json(poll);
    } catch (error) {
        if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(e => e.message);
        return res.status(400).json({ message: messages[0] });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

//Get creator's polls (auth required)
async function getMyPolls(req, res) {
    try {
        const polls = await Poll.find({ creator: req.user._id })
            .sort({ createdAt: -1 });

        res.json(polls);

    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
}

//Get poll by share code (public)
async function getPollByShareCode(req, res) {
    try {
        const poll = await Poll.findOne({ shareCode: req.params.shareCode })
        .populate('creator', 'name');

        if (!poll) return res.status(404).json({ message: 'Poll not found' });

        // Check if poll requires auth
        if (poll.requiresAuth && !req.user) {
        return res.status(401).json({ message: 'This poll requires you to be logged in', requiresAuth: true });
        }

        // If published, return full results
        if (poll.isPublished) {
        return res.json({ poll, viewMode: 'results' });
        }

        // Check if expired or inactive
        if (!poll.isActive || (poll.expiresAt && new Date() > poll.expiresAt)) {
        return res.json({ poll, viewMode: 'expired' });
        }

        // Return poll without option counts (don't bias respondents)
        const pollObj = poll.toObject();
        pollObj.questions = pollObj.questions.map(q => ({
        ...q,
        options: q.options.map(o => ({ _id: o._id, text: o.text }))
        }));

        res.json({ poll: pollObj, viewMode: 'respond', user: req.user || null });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }    
}

//Get poll by ID (creator only, full data)
async function getPollById(req, res) {
    try {
        const poll = await Poll.findById(req.params.id).populate('creator', 'name email');
        if (!poll) return res.status(404).json({ message: 'Poll not found' });

        if (poll.creator._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
        }

        res.json(poll);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

//Get analytics (creator only)
async function getPollAnalytics(req, res) {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ message: 'Poll not found' });

        if (poll.creator.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
        }

        const responses = await Response.find({ poll: poll._id })
        .populate('respondent', 'name email')
        .sort({ submittedAt: -1 });

        // Build question-wise analytics
        const analytics = poll.questions.map((question) => {
        const optionCounts = question.options.map((opt, idx) => ({
            text: opt.text,
            count: opt.count,
            index: idx,
            percentage: poll.totalResponses > 0
            ? Math.round((opt.count / poll.totalResponses) * 100)
            : 0
        }));

        const totalAnswers = optionCounts.reduce((sum, o) => sum + o.count, 0);
        const topOption = optionCounts.sort((a, b) => b.count - a.count)[0];

        return {
            questionId: question._id,
            questionText: question.text,
            isMandatory: question.isMandatory,
            totalAnswers,
            optionCounts: optionCounts.sort((a, b) => a.index - b.index),
            topOption
        };
        });

        // Recent respondents (non-anonymous only)
        const respondents = responses
        .filter(r => r.respondent)
        .map(r => ({
            name: r.respondent?.name || 'Anonymous',
            email: r.respondent?.email,
            submittedAt: r.submittedAt
        }))
        .slice(0, 10);

        res.json({
        poll: {
            _id: poll._id,
            title: poll.title,
            totalResponses: poll.totalResponses,
            isActive: poll.isActive,
            isPublished: poll.isPublished,
            isAnonymous: poll.isAnonymous,
            expiresAt: poll.expiresAt,
            createdAt: poll.createdAt
        },
        analytics,
        recentResponses: responses.slice(0, 5).map(r => ({
            respondent: poll.isAnonymous ? 'Anonymous' : (r.respondent?.name || 'Anonymous'),
            submittedAt: r.submittedAt,
            answersCount: r.answers.length
        }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

//Toggle active status
async function togglePollActive(req, res) {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ message: 'Poll not found' });
        if (poll.creator.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
        }

        poll.isActive = !poll.isActive;
        await poll.save();

        res.json({ isActive: poll.isActive, message: `Poll ${poll.isActive ? 'activated' : 'deactivated'}` });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

//Publish results
async function publishPollResults(req, res) {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ message: 'Poll not found' });
        if (poll.creator.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
        }

        poll.isPublished = true;
        poll.isActive = false;  // Close poll when publishing
        await poll.save();

        // Notify all viewers via socket
        const io = req.app.get('io');
        io.to(`poll-${poll._id}`).emit('poll-published', { pollId: poll._id });

        res.json({ message: 'Results published successfully', poll });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

// Delete a poll
async function deletePoll(req, res) {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ message: 'Poll not found' });
        if (poll.creator.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
        }

        await Response.deleteMany({ poll: poll._id });
        await poll.deleteOne();

        res.json({ message: 'Poll deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export default {
    createPolls,
    getMyPolls,
    getPollByShareCode,
    getPollById,
    getPollAnalytics,
    togglePollActive,
    publishPollResults,
    deletePoll
}