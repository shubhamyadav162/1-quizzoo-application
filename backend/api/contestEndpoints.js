const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool();

// Create Contest Endpoint
router.post('/create-contest', async (req, res) => {
  const { name, entry_fee, max_participants, is_private, created_by } = req.body;

  // Validate input fields
  if (!name || !entry_fee || !max_participants || !created_by) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Ensure entry_fee and max_participants are numbers
  const entryFee = parseFloat(entry_fee);
  const maxParticipants = parseInt(max_participants);

  if (isNaN(entryFee) || entryFee < 5) {
    return res.status(400).json({ error: 'Invalid entry fee. Must be at least ₹5.' });
  }

  if (isNaN(maxParticipants) || maxParticipants < 2 || maxParticipants > 100) {
    return res.status(400).json({ error: 'Invalid number of participants. Must be between 2 and 100.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO contests (name, entry_fee, max_participants, is_private, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, entryFee, maxParticipants, is_private, created_by]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating contest:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Join Contest Endpoint
router.post('/join-contest', async (req, res) => {
  const { contest_id, user_id } = req.body;

  if (!contest_id || !user_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO contest_participants (contest_id, user_id) VALUES ($1, $2) RETURNING *',
      [contest_id, user_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error joining contest:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 