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


// MODULE 1: RESIDENT & UNIT MANAGEMENT

// Register Member (1a)
app.post('/api/members', async (req, res) => {
  const { 
    fullName, phone, email, houseNo, block, status, 
    cnic, vehicleNo, vehicleType, ownerName, ownerPhone, ownerCnic 
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO members (
        full_name, phone_no, email, house_no, block_name, ownership_status, 
        cnic, vehicle_no, vehicle_type, 
        owner_name_if_tenant, owner_phone_if_tenant, owner_cnic_if_tenant
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [fullName, phone, email, houseNo, block, status, cnic, vehicleNo, vehicleType, ownerName, ownerPhone, ownerCnic]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("DATABASE ERROR:", err.message);
    res.status(500).json({ error: err.message });
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

// Update Member (1a - Edit)
app.put('/api/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      full_name, phone_no, email, house_no, ownership_status, 
      cnic, vehicle_no, vehicle_type, 
      owner_name_if_tenant, owner_phone_if_tenant, owner_cnic_if_tenant 
    } = req.body;

    const result = await pool.query(
      `UPDATE members SET 
        full_name=$1, phone_no=$2, email=$3, house_no=$4, ownership_status=$5,
        cnic=$6, vehicle_no=$7, vehicle_type=$8, 
        owner_name_if_tenant=$9, owner_phone_if_tenant=$10, owner_cnic_if_tenant=$11
      WHERE id = $12 RETURNING *`,
      [full_name, phone_no, email, house_no, ownership_status, cnic, vehicle_no, vehicle_type, owner_name_if_tenant, owner_phone_if_tenant, owner_cnic_if_tenant, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
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


// MODULE 2: BILLING & FINANCIALS

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

// Expense Routes
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

app.get('/api/polls/active', async (req, res) => {
  const result = await pool.query("SELECT * FROM polls WHERE is_active = true ORDER BY created_at DESC");
  res.json(result.rows);
});

app.post('/api/polls/vote', async (req, res) => {
  const { pollId, selectedOption } = req.body;
  const result = await pool.query(`UPDATE polls SET options = jsonb_set(options, ARRAY[$1], ((options->>$1)::int + 1)::text::jsonb) WHERE id = $2 RETURNING *`, [selectedOption, pollId]);
  res.json(result.rows[0]);
});

// START SERVER
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});