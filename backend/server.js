const express = require('express');
const cors = require('cors');
const pool = require('./db'); // This imports your pg connection

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());


// Mailing configuration
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'oneeb.baig@gmail.com', // Your Gmail
    pass: 'vjff hxhj pdpu beet'   // Your 16-digit Google App Password
  }
});

// Module 1

// --- REQUIREMENT 1A: REGISTER MEMBER (UPDATED) ---
app.post('/api/members', async (req, res) => {
  // 1. Destructure all the new fields from the request body
  const { 
    fullName, phone, email, houseNo, block, status, 
    cnic, vehicleNo, vehicleType, ownerName, ownerPhone, ownerCnic 
  } = req.body;

  try {
    // 2. Update the SQL to include all 11 columns
    const result = await pool.query(
      `INSERT INTO members (
        full_name, phone_no, email, house_no, block_name, ownership_status, 
        cnic, vehicle_no, vehicle_type, 
        owner_name_if_tenant, owner_phone_if_tenant, owner_cnic_if_tenant
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,$12) RETURNING *`,
      [
        fullName, phone, email, houseNo, block, status, 
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
        email, 
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


// FETCH ALL BILLS
app.get('/api/bills', async (req, res) => {
  try {
    // We start FROM units to ensure every house is represented
    const result = await pool.query(`
      SELECT 
        u.unit_no as house_no, 
        u.base_charges, 
        COALESCE(m.full_name, 'Vacant') as resident_name,
        b.billing_month,
        COALESCE(b.maintenance_charges, 0) as maintenance_charges,
        COALESCE(b.status, 'Unpaid') as status,
        b.id as bill_id
      FROM units u
      LEFT JOIN members m ON u.unit_no = m.house_no
      LEFT JOIN bills b ON u.unit_no = b.house_no
      ORDER BY u.unit_no ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


// GENERATE MONTHLY BILLS (The Automation)
app.post('/api/generate-bills', async (req, res) => {
  const { billingMonth, dueDate, amount } = req.body;
  const chargeToAdd = parseFloat(amount || 0);

  try {
    const units = await pool.query(`
      SELECT u.unit_no, u.base_charges, m.full_name, m.email 
      FROM units u
      LEFT JOIN members m ON u.unit_no = m.house_no
    `);

    const billPromises = units.rows.map(async (unit) => {
      // 1. Database Logic: Update or Insert
      const existing = await pool.query(
        "SELECT id, maintenance_charges FROM bills WHERE house_no = $1 AND billing_month = $2",
        [unit.unit_no, billingMonth]
      );

      let finalMaintenance = chargeToAdd;
      if (existing.rows.length > 0) {
        finalMaintenance = parseFloat(existing.rows[0].maintenance_charges) + chargeToAdd;
        await pool.query(
          "UPDATE bills SET maintenance_charges = $1, total_amount = $1 WHERE id = $2",
          [finalMaintenance, existing.rows[0].id]
        );
      } else {
        await pool.query(
          `INSERT INTO bills (house_no, resident_name, billing_month, maintenance_charges, total_amount, due_date, status)
           VALUES ($1, $2, $3, $4, $4, $5, 'Unpaid')`,
          [unit.unit_no, unit.full_name || 'Vacant', billingMonth, chargeToAdd, dueDate]
        );
      }

      // 2. Email Logic: Send only if email exists
      if (unit.email) {
        const totalAmount = parseFloat(unit.base_charges || 0) + finalMaintenance;
        
        const mailOptions = {
          from: '"Society Management" <your-email@gmail.com>',
          to: unit.email,
          subject: `Monthly Bill Notification - ${billingMonth}`,
          text: `Dear ${unit.full_name},\n\nA maintenance charge of ${chargeToAdd} PKR has been applied to House ${unit.unit_no} for ${billingMonth}.\n\nYour current Total Outstanding is: ${totalAmount} PKR.\nPlease ensure payment by ${dueDate}.\n\nRegards,\nSociety Office`
        };

        // We don't 'await' the email so the UI doesn't freeze waiting for SMTP
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) console.log("Mail Error for " + unit.unit_no + ": " + error);
          else console.log("Email sent to House " + unit.unit_no);
        });
      }
    });

    await Promise.all(billPromises);
    res.json({ message: "Billing processed and notifications triggered." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});



// Pay now btn
app.put('/api/bills/pay/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      "UPDATE bills SET status = 'Paid', payment_date = CURRENT_DATE WHERE id = $1",
      [id]
    );
    res.json({ message: "Payment updated in database" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Database Error");
  }
});



// Expense Tracking 

// --- EXPENSE ROUTES ---

// 1. Get all expenses
app.get('/api/expenses', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM expenses ORDER BY expense_date DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 2. Add a new expense
app.post('/api/expenses', async (req, res) => {
  const { description, category, amount, date } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO expenses (description, category, amount, expense_date) VALUES ($1, $2, $3, $4) RETURNING *",
      [description, category, amount, date]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete an expense

app.delete('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM expenses WHERE id = $1", [id]);
    res.json({ message: "Expense deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});



app.get('/api/financial-summary', async (req, res) => {
  try {
    // 1. Get total from PAID bills
    const incomeResult = await pool.query(
      "SELECT SUM(total_amount) as total_income FROM bills WHERE status = 'Paid'"
    );
    
    // 2. Get total from all expenses
    const expenseResult = await pool.query(
      "SELECT SUM(amount) as total_expenses FROM expenses"
    );

    const income = parseFloat(incomeResult.rows[0].total_income || 0);
    const expenses = parseFloat(expenseResult.rows[0].total_expenses || 0);

    res.json({
      totalIncome: income,
      totalExpenses: expenses,
      netBalance: income - expenses
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Generating Reports

app.get('/api/reports/detailed', async (req, res) => {
  try {
    const income = await pool.query(
      "SELECT house_no, resident_name, billing_month, total_amount, payment_date FROM bills WHERE status = 'Paid' ORDER BY payment_date DESC"
    );
    const expenses = await pool.query(
      "SELECT description, category, amount, expense_date FROM expenses ORDER BY expense_date DESC"
    );
    const defaulters = await pool.query(
      "SELECT house_no, resident_name, billing_month, total_amount FROM bills WHERE status = 'Unpaid' ORDER BY house_no ASC"
    );

    res.json({
      income: income.rows,
      expenses: expenses.rows,
      defaulters: defaulters.rows
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});