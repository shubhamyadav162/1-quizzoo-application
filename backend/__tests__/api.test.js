const request = require('supertest');
const express = require('express');
const apiRouter = require('../api');

const app = express();
app.use(express.json());
app.use('/api', apiRouter);

describe('API Endpoints', () => {
    test('POST /api/start-contest should return 200', async () => {
        const response = await request(app)
            .post('/api/start-contest')
            .send({ contestId: 1 });
        expect(response.statusCode).toBe(200);
    });

    test('POST /api/submit-answer should return 200', async () => {
        const response = await request(app)
            .post('/api/submit-answer')
            .send({ participantId: 1, questionId: 1, answerText: "A", responseTime: 5 });
        expect(response.statusCode).toBe(200);
    });

    test('POST /api/calculate-scores should return 200', async () => {
        const response = await request(app)
            .post('/api/calculate-scores')
            .send({ contestId: 1 });
        expect(response.statusCode).toBe(200);
    });

    test('POST /api/distribute-prizes should return 200', async () => {
        const response = await request(app)
            .post('/api/distribute-prizes')
            .send({ contestId: 1 });
        expect(response.statusCode).toBe(200);
    });
}); 