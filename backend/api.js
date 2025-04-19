const express = require('express');
const router = express.Router();
const gameLogic = require('./gameLogic');

// API endpoint to start a contest
router.post('/start-contest', (req, res) => {
    const { contestId } = req.body;
    gameLogic.handleQuestionTiming(contestId);
    res.status(200).send('Contest started');
});

// API endpoint to submit an answer
router.post('/submit-answer', (req, res) => {
    const { participantId, questionId, answerText, responseTime } = req.body;
    gameLogic.recordAnswer(participantId, questionId, answerText, responseTime);
    res.status(200).send('Answer submitted');
});

// API endpoint to calculate scores
router.post('/calculate-scores', (req, res) => {
    const { contestId } = req.body;
    gameLogic.calculateScores(contestId);
    res.status(200).send('Scores calculated');
});

// API endpoint to distribute prizes
router.post('/distribute-prizes', (req, res) => {
    const { contestId } = req.body;
    gameLogic.distributePrizes(contestId);
    res.status(200).send('Prizes distributed');
});

module.exports = router; 