const request = require('supertest');
const express = require('express');
const contestEndpoints = require('../api/contestEndpoints');

const app = express();
app.use(express.json());
app.use('/api', contestEndpoints);

jest.mock('pg', () => {
  const mPool = {
    query: jest.fn(),
    connect: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

const { Pool } = require('pg');
const pool = new Pool();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Contest API Endpoints', () => {
  it('should create a contest successfully', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 'contest1', name: 'Test Contest' }] });

    const response = await request(app)
      .post('/api/create-contest')
      .send({
        name: 'Test Contest',
        entry_fee: 10,
        max_participants: 10,
        is_private: false,
        created_by: 'user1'
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: 'contest1', name: 'Test Contest' });
  });

  it('should join a contest successfully', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 'participant1', contest_id: 'contest1', user_id: 'user1' }] });

    const response = await request(app)
      .post('/api/join-contest')
      .send({
        contest_id: 'contest1',
        user_id: 'user1'
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: 'participant1', contest_id: 'contest1', user_id: 'user1' });
  });
}); 