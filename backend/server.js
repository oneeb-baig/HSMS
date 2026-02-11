const express = require('express');
const cors = require('cors');
const pool = require('./db'); // This imports your pg connection

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// --- REQUIREMENT 1A: REGISTER MEMBER ---
app.post('/api/members', async (req, res) => {
  const { fullName, phone, houseNo, block, status } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO members (full_name, phone_no, house_no, block_name, ownership_status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [fullName, phone, houseNo, block, status]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// Start the server
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});



// --- REQUIREMENT 1b: GET ALL MEMBERS ---
// This is the "Door" React is trying to open
app.get('/api/members', async (req, res) => {
  try {
    const allMembers = await pool.query("SELECT * FROM members ORDER BY id DESC");
    res.json(allMembers.rows); // This sends the data back to React
  } catch (err) {
    console.error("GET Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- DELETE A MEMBER ---
app.delete('/api/members/:id', async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the URL
    await pool.query("DELETE FROM members WHERE id = $1", [id]);
    res.json("Member was deleted!");
  } catch (err) {
    console.error(err.message);
  }
});
// --- REQUIREMENT 1a: UPDATE/EDIT MEMBER ---
app.put('/api/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone_no, house_no, ownership_status } = req.body;

    const updateMember = await pool.query(
      "UPDATE members SET full_name = $1, phone_no = $2, house_no = $3, ownership_status = $4 WHERE id = $5 RETURNING *",
      [full_name, phone_no, house_no, ownership_status, id]
    );

    res.json(updateMember.rows[0]);
    console.log("Member Updated successfully!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});