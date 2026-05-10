const express = require('express');
const cors = require('cors');
const pool = require('./db');
const nodemailer = require('nodemailer');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// --- MAILING CONFIGURATION ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'oneeb.baig@gmail.com', 
    pass: 'vjff hxhj pdpu beet'   
  }
});


// Global Login Route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`Login attempt for: ${username}`); // Debug log

    try {
        const userQuery = `
    SELECT 
        u.username, u.role, u.linked_id,
        m.full_name AS res_name, m.house_no,
        s.full_name AS staff_name
    FROM users u
    LEFT JOIN members m ON u.linked_id::text = m.id::text AND u.role = 'resident'
    LEFT JOIN staff_registry s ON u.linked_id::text = s.staff_id::text AND u.role = 'guard'
    WHERE u.username = $1 AND u.password_hash = $2`;

        const result = await pool.query(userQuery, [username, password]);
        
        console.log("Database result rows:", result.rows.length); // See if it found anyone

        if (result.rows.length > 0) {
            const user = result.rows[0];
            
            // Safe assignment with fallback values
            const fullName = user.role === 'resident' ? user.res_name : 
                           (user.role === 'guard' ? user.staff_name : 'Admin');
            const houseNo = user.house_no || 'N/A';

            res.json({
                success: true,
                username: user.username,
                role: user.role,
                linked_id: user.linked_id,
                fullName: fullName || 'User',
                houseNo: houseNo
            });
        } else {
            res.status(401).json({ success: false, error: "Invalid username or password" });
        }
    } catch (err) {
        console.error("CRITICAL BACKEND ERROR:", err); // This MUST show in terminal
        res.status(500).json({ success: false, error: "Database communication failed" });
    }
});


app.get('/api/dashboard-summary', async (req, res) => {
  try {
    const results = {};

    // Test Bills
    try {
      const r = await pool.query("SELECT COALESCE(SUM(total_amount), 0) as total FROM bills WHERE status = 'Paid'");
      results.income = Number(r.rows[0].total);
    } catch (e) { console.error("Error in Bills Query:", e.message); throw e; }

    // Test Expenses
    try {
      const r = await pool.query('SELECT COALESCE(SUM("amount"), 0) as total FROM expenses');
      results.expenses = Number(r.rows[0].total);
    } catch (e) { console.error("Error in Expenses Query:", e.message); throw e; }

    // Test Counts (Combined for speed)
    const counts = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM units) as houses,
        (SELECT COUNT(*) FROM members) as residents,
        (SELECT COUNT(*) FROM staff_registry) as staff,
        (SELECT COUNT(*) FROM notices WHERE category = 'SOS') as sos
    `);
    
    const c = counts.rows[0];
    res.json({
      totalIncome: results.income,
      totalExpenses: results.expenses,
      netBalance: results.income - results.expenses,
      totalHouses: Number(c.houses),
      totalResidents: Number(c.residents),
      activeStaff: Number(c.staff),
      pendingSOS: Number(c.sos)
    });

  } catch (err) {
    res.status(500).json({ error: "Check terminal for specific query failure" });
  }
});


// Member Registration 1a:

app.post('/api/members', async (req, res) => {
  const { 
    fullName, phone, email, houseNo, block, status, 
    cnic, vehicleNo, vehicleType, ownerName, ownerPhone, ownerCnic,
    username, password // <-- Destructure new fields from frontend
  } = req.body;

  const client = await pool.connect(); // Use a client for Transaction

  try {
    await client.query('BEGIN'); // Start Transaction

    // 1. Insert into members table
    const memberResult = await client.query(
      `INSERT INTO members (
        full_name, phone_no, email, house_no, block_name, ownership_status, 
        cnic, vehicle_no, vehicle_type, 
        owner_name_if_tenant, owner_phone_if_tenant, owner_cnic_if_tenant
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
      [fullName, phone, email, houseNo, block, status, cnic, vehicleNo, vehicleType, ownerName, ownerPhone, ownerCnic]
    );

    const newMemberId = memberResult.rows[0].id;

    // 2. Insert into users table
    await client.query(
      `INSERT INTO users (username, password_hash, role, linked_id) 
       VALUES ($1, $2, $3, $4)`,
      [username, password, 'resident', newMemberId] // Hardcoded 'resident' role
    );

    await client.query('COMMIT'); // Save both changes
    res.json({ message: "Resident and Login account created successfully!" });

  } catch (err) {
    await client.query('ROLLBACK'); // Undo everything if there is an error
    console.error("REGISTRATION ERROR:", err.message);
    
    // Check for duplicate username error
    if (err.code === '23505') {
        res.status(400).json({ error: "Username already exists. Please choose another." });
    } else {
        res.status(500).json({ error: "Database error: " + err.message });
    }
  } finally {
    client.release(); // Release client back to pool
  }
});

// Get All Members (1b)
app.get('/api/members', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM members ORDER BY id DESC");
    res.json(result.rows); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Member (1a - Edit) - UPDATED TO INCLUDE BLOCK
app.put('/api/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      full_name, phone_no, email, house_no, 
      block_name, // <-- ADDED THIS
      ownership_status, 
      cnic, vehicle_no, vehicle_type, 
      owner_name_if_tenant, owner_phone_if_tenant, owner_cnic_if_tenant 
    } = req.body;

    const result = await pool.query(
      `UPDATE members SET 
        full_name=$1, phone_no=$2, email=$3, house_no=$4, 
        block_name=$5, -- <-- ADDED THIS
        ownership_status=$6,
        cnic=$7, vehicle_no=$8, vehicle_type=$9, 
        owner_name_if_tenant=$10, owner_phone_if_tenant=$11, owner_cnic_if_tenant=$12
      WHERE id = $13 RETURNING *`,
      [
        full_name, phone_no, email, house_no, 
        block_name, // Index $5
        ownership_status, cnic, vehicle_no, vehicle_type, 
        owner_name_if_tenant, owner_phone_if_tenant, owner_cnic_if_tenant, 
        id // Index $13
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Delete Member
app.delete('/api/members/:id', async (req, res) => {
  try {
    await pool.query("DELETE FROM members WHERE id = $1", [req.params.id]);
    res.json("Member deleted");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Transfer Ownership (1c) - Optimized with Transaction
app.post('/api/transfer-ownership', async (req, res) => {
  const { house_no, previous_owner, new_owner, transfer_type } = req.body;
  try {
    await pool.query('BEGIN');
    await pool.query("UPDATE members SET full_name = $1 WHERE house_no = $2", [new_owner, house_no]);
    await pool.query(
      "INSERT INTO ownership_history (house_no, previous_owner, new_owner, transfer_type) VALUES ($1, $2, $3, $4)",
      [house_no, previous_owner, new_owner, transfer_type || 'Sale']
    );
    await pool.query('COMMIT');
    res.json({ message: "Transfer successful" });
  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(500).send("Transfer failed");
  }
});

// Get Ownership History
app.get('/api/ownership-history', async (req, res) => {
  try {
    const history = await pool.query("SELECT * FROM ownership_history ORDER BY transfer_date DESC");
    res.json(history.rows);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// Unit Routes
app.get('/api/units', async (req, res) => {
  const allUnits = await pool.query("SELECT * FROM units ORDER BY unit_no ASC");
  res.json(allUnits.rows);
});

app.post('/api/units', async (req, res) => {
  const { unit_no, unit_type, floor_no, base_charges, marla } = req.body; 
  const newUnit = await pool.query(
    "INSERT INTO units (unit_no, unit_type, floor_no, base_charges, marla) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [unit_no, unit_type, floor_no || null, base_charges || 0, marla || null]
  );
  res.json(newUnit.rows[0]);
});


// 1. Delete Unit
app.delete('/api/units/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM units WHERE unit_id = $1", [id]);
    res.json({ message: "Unit deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error: Check if this unit is linked to a resident.");
  }
});

// 2. Update Unit
app.put('/api/units/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { unit_no, unit_type, floor_no, base_charges, marla } = req.body;
    
    await pool.query(
      `UPDATE units SET 
        unit_no = $1, unit_type = $2, floor_no = $3, base_charges = $4, marla = $5 
       WHERE unit_id = $6`,
      [unit_no, unit_type, floor_no, base_charges, marla, id]
    );
    res.json({ message: "Unit updated successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


// MODULE 2: BILLING & FINANCES

app.get('/api/bills', async (req, res) => {
  const result = await pool.query(`
    SELECT u.unit_no as house_no, u.base_charges, COALESCE(m.full_name, 'Vacant') as resident_name,
    b.billing_month, COALESCE(b.maintenance_charges, 0) as maintenance_charges,
    COALESCE(b.status, 'Unpaid') as status, b.id as bill_id
    FROM units u
    LEFT JOIN members m ON u.unit_no = m.house_no
    LEFT JOIN bills b ON u.unit_no = b.house_no
    ORDER BY u.unit_no ASC
  `);
  res.json(result.rows);
});

app.post('/api/generate-bills', async (req, res) => {
  const { billingMonth, dueDate, amount } = req.body;
  const chargeToAdd = parseFloat(amount || 0);

  try {
    const units = await pool.query("SELECT u.unit_no, u.base_charges, m.full_name, m.email FROM units u LEFT JOIN members m ON u.unit_no = m.house_no");

    const billPromises = units.rows.map(async (unit) => {
      const existing = await pool.query("SELECT id, maintenance_charges FROM bills WHERE house_no = $1 AND billing_month = $2", [unit.unit_no, billingMonth]);

      let finalMaintenance = chargeToAdd;
      if (existing.rows.length > 0) {
        finalMaintenance = parseFloat(existing.rows[0].maintenance_charges) + chargeToAdd;
        await pool.query("UPDATE bills SET maintenance_charges = $1, total_amount = $1 WHERE id = $2", [finalMaintenance, existing.rows[0].id]);
      } else {
        await pool.query(`INSERT INTO bills (house_no, resident_name, billing_month, maintenance_charges, total_amount, due_date, status) VALUES ($1, $2, $3, $4, $4, $5, 'Unpaid')`, [unit.unit_no, unit.full_name || 'Vacant', billingMonth, chargeToAdd, dueDate]);
      }

      if (unit.email) {
        const mailOptions = {
          from: '"Society Management" <oneeb.baig@gmail.com>',
          to: unit.email,
          subject: `Monthly Bill - ${billingMonth}`,
          text: `Dear ${unit.full_name}, a charge of ${chargeToAdd} PKR has been applied. Total due: ${finalMaintenance} PKR.`
        };
        transporter.sendMail(mailOptions);
      }
    });

    await Promise.all(billPromises);
    res.json({ message: "Billing processed" });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

app.put('/api/bills/pay/:id', async (req, res) => {
  await pool.query("UPDATE bills SET status = 'Paid', payment_date = CURRENT_DATE WHERE id = $1", [req.params.id]);
  res.json({ message: "Paid" });
});

// Expense
app.get('/api/expenses', async (req, res) => {
  const result = await pool.query("SELECT * FROM expenses ORDER BY expense_date DESC");
  res.json(result.rows);
});

app.post('/api/expenses', async (req, res) => {
  const { description, category, amount, date } = req.body;
  const result = await pool.query("INSERT INTO expenses (description, category, amount, expense_date) VALUES ($1, $2, $3, $4) RETURNING *", [description, category, amount, date]);
  res.json(result.rows[0]);
});

// Financial Reports
app.get('/api/reports/detailed', async (req, res) => {
  const income = await pool.query("SELECT * FROM bills WHERE status = 'Paid'");
  const expenses = await pool.query("SELECT * FROM expenses");
  const defaulters = await pool.query("SELECT * FROM bills WHERE status = 'Unpaid'");
  res.json({ income: income.rows, expenses: expenses.rows, defaulters: defaulters.rows });
});


// MODULE 3: COMMUNICATION HUB

app.get('/api/complaints', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM complaints ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error fetching complaints" });
  }
});

app.post('/api/complaints', async (req, res) => {
  const { subject, description, house_no, resident_name } = req.body;
  const result = await pool.query("INSERT INTO complaints (subject, description, house_no, resident_name, status) VALUES ($1, $2, $3, $4, 'Pending') RETURNING *", [subject, description, house_no, resident_name]);
  res.json(result.rows[0]);
});


// Resolve a complaint
app.put('/api/complaints/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE complaints SET status = 'Resolved' WHERE id = $1 RETURNING *",
      [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete a complaint
app.delete('/api/complaints/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM complaints WHERE id = $1", [id]);
    res.json({ message: "Complaint deleted successfully" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/api/sos', async (req, res) => {
  const { house_no, resident_name } = req.body;
  await pool.query("INSERT INTO complaints (subject, description, status, house_no, resident_name) VALUES ($1, $2, $3, $4, $5)", ['EMERGENCY SOS', 'Resident triggered an alert!', 'Urgent', house_no, resident_name]);
  res.json({ message: "SOS Sent" });
});

app.get('/api/notices', async (req, res) => {
  const result = await pool.query("SELECT * FROM notices ORDER BY created_at DESC");
  res.json(result.rows);
});

app.post('/api/notices', async (req, res) => {
  const { title, content, category, scheduled_date, scheduled_time } = req.body;
  const result = await pool.query("INSERT INTO notices (title, content, category, scheduled_date, scheduled_time) VALUES ($1, $2, $3, $4, $5) RETURNING *", [title, content, category, scheduled_date || null, scheduled_time || null]);
  res.json(result.rows[0]);
});

app.delete('/api/notices/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Execute the delete query
        const result = await pool.query("DELETE FROM notices WHERE id = $1 RETURNING *", [id]);

        // Check if the notice actually existed
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Notice not found." });
        }

        res.json({ message: "Notice deleted successfully", deletedNotice: result.rows[0] });
    } catch (err) {
        console.error("Delete Error:", err.message);
        res.status(500).send("Server Error");
    }
});


app.get('/api/polls/active', async (req, res) => {
  const result = await pool.query("SELECT * FROM polls WHERE is_active = true ORDER BY created_at DESC");
  res.json(result.rows);
});



app.post('/api/polls/vote', async (req, res) => {
  const { pollId, selectedOption, residentName } = req.body;
  
  // Validation to prevent empty data from hitting the database
  if (!pollId || !selectedOption || !residentName) {
    return res.status(400).json({ error: "Missing required voting data" });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // Start Transaction

    // 1. Check if this resident has already voted on this specific poll
    const existingVote = await client.query(
      "SELECT selected_option FROM poll_votes WHERE poll_id = $1 AND resident_name = $2",
      [pollId, residentName]
    );

    if (existingVote.rows.length > 0) {
      const oldOption = existingVote.rows[0].selected_option;

      // If they are trying to vote for the same option, exit early
      if (oldOption === selectedOption) {
        await client.query('ROLLBACK');
        return res.json({ message: "You have already voted for this option." });
      }

      // 2. Decrement the count for the OLD option in the 'polls' table
      await client.query(
        `UPDATE polls 
         SET options = jsonb_set(options, ARRAY[$1], ((options->>$1)::int - 1)::text::jsonb) 
         WHERE id = $2`,
        [oldOption, pollId]
      );

      // 3. Update the choice in the 'poll_votes' tracking table
      await client.query(
        "UPDATE poll_votes SET selected_option = $1 WHERE poll_id = $2 AND resident_name = $3",
        [selectedOption, pollId, residentName]
      );
    } else {
      // 4. If first-time voter, insert a new record into 'poll_votes'
      await client.query(
        "INSERT INTO poll_votes (poll_id, resident_name, selected_option) VALUES ($1, $2, $3)",
        [pollId, residentName, selectedOption]
      );
    }

    // 5. Increment the count for the NEW option in the 'polls' table
    const result = await client.query(
      `UPDATE polls 
       SET options = jsonb_set(options, ARRAY[$1], ((options->>$1)::int + 1)::text::jsonb) 
       WHERE id = $2 RETURNING *`,
      [selectedOption, pollId]
    );

    await client.query('COMMIT'); // Finalize all changes
    res.json(result.rows[0]); // Return the updated poll object to the frontend
    
  } catch (err) {
    await client.query('ROLLBACK'); // Undo everything if any step fails
    console.error("Critical Voting Error:", err.message);
    res.status(500).json({ error: "Internal server error processing your vote." });
  } finally {
    client.release(); // Return the database connection to the pool
  }
});

app.delete('/api/polls/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM polls WHERE id = $1", [id]);
    res.json({ message: "Poll deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error deleting poll" });
  }
});


// Requiremnet 4a

// 1. Log a New Visitor (Entry)
app.post('/api/visitors/check-in', async (req, res) => {
    const { visitorName, phone, houseNo, purpose, vehicleNo, status, approvedBy } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO visitor_logs (visitor_name, visitor_phone, house_no, purpose, vehicle_no, status, approved_by) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [visitorName, phone, houseNo, purpose, vehicleNo, status || 'Checked-in', approvedBy || 'Gate']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to log entry" });
    }
});

// 2. Log Exit (Update Exit Time)
app.put('/api/visitors/check-out/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query(
            "UPDATE visitor_logs SET exit_time = CURRENT_TIMESTAMP, status = 'Checked-out' WHERE id = $1",
            [id]
        );
        res.json({ message: "Visitor checked out successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to log exit" });
    }
});

// 3. Get Active & Pending Visitors (For the Gate Security View)
app.get('/api/visitors/active', async (req, res) => {
    try {
        // Updated Query: Fetch both 'Checked-in' AND 'Pending' statuses
        const result = await pool.query(
            "SELECT * FROM visitor_logs WHERE status = 'Checked-in' OR status = 'Pending' ORDER BY entry_time DESC"
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Fetch failed" });
    }
});


// 4. Confirm Arrival of Pre-Approved Guest
app.put('/api/visitors/confirm-arrival/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query(
            `UPDATE visitor_logs 
             SET status = 'Checked-in', 
                 entry_time = CURRENT_TIMESTAMP 
             WHERE id = $1`,
            [id]
        );
        res.json({ message: "Guest arrival confirmed" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to confirm arrival" });
    }
});

// Requirement 4b

// Optimized Attendance Toggle
app.post('/api/staff/attendance', async (req, res) => {
    const { staffId } = req.body;
    try {
        const staffCheck = await pool.query(
            "SELECT status FROM staff_registry WHERE staff_id = $1",
            [staffId]
        );
        
        if (staffCheck.rows.length === 0) return res.status(404).json({ error: "Staff not found" });

        // Logic: If they are NOT 'In', they must be 'Out' or 'Active' (New)
        const isInside = staffCheck.rows[0].status === 'In';

        if (!isInside) {
            // ACTION: MARK ENTRY
            await pool.query("INSERT INTO staff_attendance (staff_id) VALUES ($1)", [staffId]);
            await pool.query("UPDATE staff_registry SET status = 'In' WHERE staff_id = $1", [staffId]);
            res.json({ message: "Entry Marked" });
        } else {
            // ACTION: MARK EXIT
            await pool.query(
                "UPDATE staff_attendance SET check_out_time = CURRENT_TIMESTAMP WHERE staff_id = $1 AND check_out_time IS NULL",
                [staffId]
            );
            await pool.query("UPDATE staff_registry SET status = 'Out' WHERE staff_id = $1", [staffId]);
            res.json({ message: "Exit Marked" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Attendance failed" });
    }
});

// GET all registered staff
app.get('/api/staff', async (req, res) => {
    try {
        // Change: Fetch everyone who is 'In' OR 'Out' OR 'Active'
        // This stops them from disappearing when status changes
        const result = await pool.query(
            "SELECT * FROM staff_registry WHERE status IN ('In', 'Out', 'Active') ORDER BY full_name ASC"
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch staff list" });
    }
});

// Register New Staff
app.post('/api/staff/register', async (req, res) => {
  const { fullName, role, phone, cnic, username, password } = req.body;
  
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Insert into staff_registry using your 'staff_id' column
    const staffResult = await client.query(
      "INSERT INTO staff_registry (full_name, role, phone_number, id_card_no) VALUES ($1, $2, $3, $4) RETURNING staff_id",
      [fullName, role, phone, cnic]
    );

    const newStaffId = staffResult.rows[0].staff_id;

    // 2. Normalize the role for the 'users' table
    // If the role is 'Guard', it becomes 'guard' to match the DB constraint
    const loginRole = role.toLowerCase(); 

    await client.query(
      "INSERT INTO users (username, password_hash, role, linked_id) VALUES ($1, $2, $3, $4)",
      [username, password, loginRole, newStaffId]
    );

    await client.query('COMMIT');
    res.json({ message: "Guard registered and login created!" });

  } 
  
  catch (err) {
    await client.query('ROLLBACK');
    console.error("FULL DATABASE ERROR:", err); // Look at your Terminal window!
    res.status(500).json({ 
        error: err.message, 
        detail: err.detail,
        code: err.code 
    });
}
  finally {
    client.release();
  }
});


// Requirement 4c: Get Status of All Gates
app.get('/api/gates', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM gates ORDER BY gate_id ASC");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch gate status" });
    }
});

// Requirement 4c: Toggle Gate Status (Lock/Open)
app.put('/api/gates/toggle/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Get current status
        const gate = await pool.query("SELECT current_status FROM gates WHERE gate_id = $1", [id]);
        if (gate.rows.length === 0) return res.status(404).json({ error: "Gate not found" });

        const newStatus = gate.rows[0].current_status === 'Locked' ? 'Open' : 'Locked';

        // 2. Update status and timestamp
        await pool.query(
            "UPDATE gates SET current_status = $1, last_action_time = CURRENT_TIMESTAMP WHERE gate_id = $2",
            [newStatus, id]
        );

        res.json({ message: `Gate ${newStatus} successfully`, newStatus });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to operate gate" });
    }
});


// Requirement 4D

// Get all routes with assigned guard names
app.get('/api/patrol/routes', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT r.*, s.full_name as guard_name 
            FROM patrol_routes r
            LEFT JOIN staff_registry s ON r.assigned_staff_id = s.staff_id
            ORDER BY r.route_id ASC
        `);
        res.json(result.rows); // This sends the array to React
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch routes" });
    }
});

// Assign a guard to a route
app.put('/api/patrol/assign', async (req, res) => {
    const { routeId, staffId } = req.body;
    try {
        await pool.query(
            "UPDATE patrol_routes SET assigned_staff_id = $1, last_patrol_time = CURRENT_TIMESTAMP WHERE route_id = $2",
            [staffId, routeId]
        );
        res.json({ message: "Guard assigned to route" });
    } catch (err) {
        res.status(500).json({ error: "Assignment failed" });
    }
});


// Unassign a guard from a route
app.put('/api/patrol/unassign/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query(
            "UPDATE patrol_routes SET assigned_staff_id = NULL WHERE route_id = $1",
            [id]
        );
        res.json({ message: "Guard unassigned successfully" });
    } catch (err) {
        res.status(500).json({ error: "Unassignment failed" });
    }
});

// Requirement 5

// 5a

// Get all facilities and their general status
app.get('/api/facilities', async (req, res) => {
    try {
        // This query checks if there's a booking for the current date and time
        const result = await pool.query(`
            SELECT 
                f.*, 
                CASE 
                    WHEN b.booking_id IS NOT NULL THEN 'Booked' 
                    ELSE f.status 
                END as current_display_status,
                b.resident_name as current_occupant
            FROM facilities f
            LEFT JOIN facility_bookings b ON f.facility_id = b.facility_id 
                AND b.booking_date = CURRENT_DATE 
                AND CURRENT_TIME BETWEEN b.start_time AND b.end_time
            ORDER BY f.facility_id ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch facilities" });
    }
});

// New route to get the full schedule (dates and times)
app.get('/api/facilities/bookings/all', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT b.*, f.name as facility_name 
            FROM facility_bookings b
            JOIN facilities f ON b.facility_id = f.facility_id
            WHERE b.booking_date >= CURRENT_DATE
            ORDER BY b.booking_date ASC, b.start_time ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch booking schedule" });
    }
});

// Create a new booking
app.post('/api/facilities/book', async (req, res) => {
    const { facility_id, resident_name, booking_date, start_time, end_time } = req.body;

    try {
        // Check for any overlap for this specific facility on this specific date
        const overlapCheck = await pool.query(
            `SELECT * FROM facility_bookings 
             WHERE facility_id = $1 
             AND booking_date = $2 
             AND (
                (start_time <= $3 AND end_time > $3) OR 
                (start_time < $4 AND end_time >= $4) OR
                ($3 <= start_time AND $4 >= end_time)
             )`,
            [facility_id, booking_date, start_time, end_time]
        );

        if (overlapCheck.rows.length > 0) {
            return res.status(400).json({ error: "This time slot is already booked for this facility." });
        }

        // If no overlap, proceed to insert
        await pool.query(
            "INSERT INTO facility_bookings (facility_id, resident_name, booking_date, start_time, end_time) VALUES ($1, $2, $3, $4, $5)",
            [facility_id, resident_name, booking_date, start_time, end_time]
        );

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Requirement 5b

// Get all inventory items
app.get('/api/inventory', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM society_inventory ORDER BY item_id ASC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch inventory" });
    }
});

// Add a new item
app.post('/api/inventory/add', async (req, res) => {
    const { item_name, category, quantity, status } = req.body;
    try {
        await pool.query(
            "INSERT INTO society_inventory (item_name, category, quantity, status) VALUES ($1, $2, $3, $4)",
            [item_name, category, quantity, status]
        );
        res.json({ message: "Item added to inventory" });
    } catch (err) {
        res.status(500).json({ error: "Failed to add item" });
    }
});


// Delete an item
app.delete('/api/inventory/:id', async (req, res) => {
    try {
        await pool.query("DELETE FROM society_inventory WHERE item_id = $1", [req.params.id]);
        res.json({ message: "Item deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete item" });
    }
});

// Update item details (Edit)
app.put('/api/inventory/:id', async (req, res) => {
    const { item_name, category, quantity, status } = req.body;
    try {
        await pool.query(
            "UPDATE society_inventory SET item_name=$1, category=$2, quantity=$3, status=$4, last_inspected=CURRENT_DATE WHERE item_id=$5",
            [item_name, category, quantity, status, req.params.id]
        );
        res.json({ message: "Item updated" });
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
});



// START SERVER
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});