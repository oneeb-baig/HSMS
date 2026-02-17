const express = require('express');
const cors = require('cors');
const pool = require('./db'); // This imports your pg connection

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());


// Module 1

// --- REQUIREMENT 1A: REGISTER MEMBER (UPDATED) ---
app.post('/api/members', async (req, res) => {
  // 1. Destructure all the new fields from the request body
  const { 
    fullName, phone, houseNo, block, status, 
    cnic, vehicleNo, vehicleType, ownerName, ownerPhone, ownerCnic 
  } = req.body;

  try {
    // 2. Update the SQL to include all 11 columns
    const result = await pool.query(
      `INSERT INTO members (
        full_name, phone_no, house_no, block_name, ownership_status, 
        cnic, vehicle_no, vehicle_type, 
        owner_name_if_tenant, owner_phone_if_tenant, owner_cnic_if_tenant
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        fullName, phone, houseNo, block, status, 
        cnic, vehicleNo, vehicleType, 
        ownerName, ownerPhone, ownerCnic
      ]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error("DATABASE ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Start the server
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});


// --- REQUIREMENT 1b: GET ALL MEMBERS ---
app.get('/api/members', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        full_name, 
        phone_no, 
        house_no, 
        block_name, 
        ownership_status, 
        cnic, 
        vehicle_no, 
        vehicle_type, 
        owner_name_if_tenant, 
        owner_phone_if_tenant, 
        owner_cnic_if_tenant
      FROM members 
      ORDER BY id DESC
    `);
    res.json(result.rows); 
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



// --- REQUIREMENT 1c: TRANSFER OWNERSHIP ---
app.post('/api/members/transfer', async (req, res) => {
  const { houseNo, oldOwner, newOwner, transferType } = req.body;
  
  try {
    // 1. Log the history
    await pool.query(
      "INSERT INTO ownership_history (house_no, previous_owner, new_owner, transfer_type) VALUES ($1, $2, $3, $4)",
      [houseNo, oldOwner, newOwner, transferType]
    );

    // 2. Update the main members table to show the new owner
    // This assumes the new owner's other details (phone) will be updated via Edit later
    await pool.query(
      "UPDATE members SET full_name = $1 WHERE house_no = $2",
      [newOwner, houseNo]
    );

    res.json({ message: "Ownership transferred and history logged!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Transfer Failed");
  }
});


app.get('/api/ownership-history', async (req, res) => {
  try {
    const history = await pool.query("SELECT * FROM ownership_history ORDER BY transfer_date DESC");
    res.json(history.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});




// GET all units
app.get('/api/units', async (req, res) => {
  try {
    const allUnits = await pool.query("SELECT * FROM units ORDER BY unit_no ASC");
    res.json(allUnits.rows);
  } catch (err) {
    console.error(err.message);
  }
});

// POST a new unit
app.post('/api/units', async (req, res) => {
  try {
    const { unit_no, unit_type, floor_no, base_charges, marla } = req.body; 
    
    // SQL query now includes 5 columns
    const newUnit = await pool.query(
      "INSERT INTO units (unit_no, unit_type, floor_no, base_charges, marla) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [
        unit_no, 
        unit_type, 
        floor_no || null,    // If empty, send null
        base_charges || 0,   // Default to 0 if empty
        marla || null        // If empty, send null
      ]
    );
    res.json(newUnit.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


// DELETE a unit
app.delete('/api/units/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM units WHERE unit_id = $1", [id]);
    res.json("Unit was deleted!");
  } catch (err) {
    console.error(err.message);
  }
});

// UPDATE a unit
app.put('/api/units/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { unit_no, unit_type, floor_no, base_charges, marla } = req.body;
    await pool.query(
      "UPDATE units SET unit_no = $1, unit_type = $2, floor_no = $3, base_charges = $4, marla = $5 WHERE unit_id = $6",
      [unit_no, unit_type, floor_no || null, base_charges || 0, marla || null, id]
    );
    res.json("Unit was updated!");
  } catch (err) {
    console.error(err.message);
  }
});


// Transfer ownership

app.post('/api/transfer-ownership', async (req, res) => {
  const { house_no, previous_owner, new_owner, transfer_type } = req.body;
  
  try {
    // Start a transaction
    await pool.query('BEGIN');

    // 1. Update the Current Resident in the members table
    await pool.query(
      "UPDATE members SET full_name = $1 WHERE house_no = $2",
      [new_owner, house_no]
    );

    // 2. Add the log entry into ownership_history table
    await pool.query(
      "INSERT INTO ownership_history (house_no, previous_owner, new_owner, transfer_type) VALUES ($1, $2, $3, $4)",
      [house_no, previous_owner, new_owner, transfer_type || 'Sale']
    );

    await pool.query('COMMIT');
    res.json({ message: "Transfer successful and history logged!" });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send("Transfer failed");
  }
});



// Module 2