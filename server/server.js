import express from "express";
import Database from "better-sqlite3";
import cors from "cors";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const client = new Pool({
  connectionString: process.env.CONNECTION_STRING,
  ssl:{
    rejectUnauthorized: false,
  },
});
await client.connect();

const app = express();
// const db = new Database("db/cafe.db");
const port = 5001;
app.use(cors());
app.use(express.json());



app.get("/categories", async (req, res) => {
  const categories = await client.query(`
        SELECT*FROM categories
        `);

  res.json(categories.rows);
});
app.get("/foods", async (req, res) => {
  const foods = await client.query(`
        SELECT*FROM foods
        `);
  res.json(foods.rows);
});

app.get("/food-options", async (req, res) => {
  try {
    const foods = await client.query(`
            SELECT*FROM food_options
            `);

    res.json(foods.rows);
  } catch (error) {
    console.log(error);
  }
});

app.post("/kot", async (req, res) => {
  try {
    const {
      tableNumber,
      transferTable,
      customerName,
      parcel,
      description,
      items,
    } = req.body;

    // find table

    const result = await client.query(
      `
        SELECT *
        FROM tables
        WHERE table_number = $1
      `,
      [tableNumber]
    );
    const table = result.rows[0];
    if (!table) {
      return res.status(404).json({
        error: "Table not found",
      });
    }
    let billId = table.current_bill_id;

    if (customerName) {
      await client.query(
        `
        UPDATE bills
        SET customer_name = $1
        WHERE bill_id = $2
      `,[customerName, billId]
      );
    };

    if (description) {
      await client.query(
        `
        UPDATE bills
        SET description = $1
        WHERE bill_id = $2
      `,[description, billId]
      );
    }

    //create bill if not exists

    if (!billId) {
      const result = await client.query(
        `
          INSERT INTO bills (
            table_number,
            customer_name,
            description,
            parcel,
            status,
            total_cost,
            created_at
          )
          VALUES (
            $1, $2, $3, $4,
            'ACTIVE',
            0,
            CURRENT_TIMESTAMP
          )
          RETURNING bill_id
        `,[tableNumber, customerName, description, parcel ? 1 : 0]
      );
      billId = result.rows[0].bill_id;

      await client.query(
        `
        UPDATE tables
        SET
          status = 'OCCUPIED',
          current_bill_id = $1
        WHERE table_number = $2
      `,[billId, tableNumber]
      );
    }

    //insert order

    let totalAdded = 0;

    for (const item of items) {
      await client.query(
        `
        INSERT INTO orders (
          food_id,
          bill_id,
          option_id,
          quantity,
          unit_price,
          total_price,
          created_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6,
          CURRENT_TIMESTAMP
        )
        `,
        [
          item.food_id,
          billId,
          item.option_id,
          item.qty,
          item.price,
          item.finalPrice,
        ]
      );

      totalAdded += item.finalPrice;
    }

    //table transfer logic
    if (transferTable && transferTable !== tableNumber) {
     await client.query(
        `
        UPDATE tables
        SET
          status = 'AVAILABLE',
          current_bill_id = NULL
        WHERE table_number = $1
      `,[tableNumber]
      );

      await client.query(
        `
        UPDATE tables
        SET
          status = 'OCCUPIED',
          current_bill_id = $1
        WHERE table_number = $2
      `,[billId, transferTable]
      );

      await client.query(
        `
        UPDATE bills
        SET table_number = $1
        WHERE bill_id = $2
      `,[transferTable, billId]
      );
    }
    //bill total update
    await client.query(
      `
      UPDATE bills
      SET total_cost =
        total_cost + $1
      WHERE bill_id = $2
    `,[totalAdded, billId]
  );

    res.json({
      success: true,
      billId,
      inserted: items.length,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err.message,
    });
  }
});

app.post("/bill", async (req, res) => {
  try {
    const { tableNumber, customerName, description, parcel, items } = req.body;

    // =====================
    // FIND ACTIVE BILL
    // =====================

    const result = await client.query(
        `
        SELECT *
        FROM tables
        WHERE table_number = $1
      `, [tableNumber]
      )
      const table = result.rows[0];

    if (!table) {
      return res.status(404).json({
        error: "Table not found",
      });
    }

    let billId = table.current_bill_id;

    // =====================
    // CREATE BILL IF NONE
    // =====================

    if (!billId) {
      const billResult = await client.query(
          `
          INSERT INTO bills (
            table_number,
            customer_name,
            description,
            parcel,
            status,
            total_cost,
            created_at
          )
          VALUES (
            $1, $2, $3, $4,
            'ACTIVE',
            0,
            CURRENT_TIMESTAMP
          )
        `,
        [tableNumber, customerName, description, parcel ? 1 : 0]
      );

      billId = billResult.rows[0].bill_id;

      await client.query(
        `
        UPDATE tables
        SET
          status = 'OCCUPIED',
          current_bill_id = $1
        WHERE table_number = $2
      `, [billId, tableNumber]);
    }

    // =====================
    // UPDATE CUSTOMER INFO
    // =====================

    if (customerName || description) {
      await client.query(
        `
        UPDATE bills
        SET
          customer_name = $1,
          description = $2
        WHERE bill_id = $3
        `,
        [customerName, description, billId]
      );
    }

    // =====================
    // INSERT NEW ITEMS
    // =====================

    const newItems = items.filter((item) => item.isNew);
    
    let addedTotal = 0;
    for (const item of newItems) {
      await client.query(`
        INSERT INTO orders (
          food_id,
          bill_id,
          option_id,
          quantity,
          unit_price,
          total_price,
          created_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6,
          CURRENT_TIMESTAMP
        )
      `, [
        item.food_id,
        billId,
        item.option_id,
        item.qty,
        item.price,
        item.finalPrice,
      ]
    );

      addedTotal += item.finalPrice;
    }

    // =====================
    // UPDATE BILL TOTAL
    // =====================

    await client.query(
      `
      UPDATE bills
      SET total_cost =
        total_cost + $1
      WHERE bill_id = $2
    `,[addedTotal, billId]
  );

    // =====================
    // GET INVOICE ITEMS
    // =====================

    const InvoicerResult = await client.query(
        `
        SELECT
          o.quantity,
          o.unit_price,
          o.total_price,
          f.food_name,
          fo.option_name
        FROM orders o
        JOIN foods f
          ON o.food_id =
             f.food_id
        LEFT JOIN food_options fo
          ON o.option_id =
             fo.option_id
        WHERE o.bill_id = $1
      `,[billId]
      );
  
    const invoiceItems = InvoicerResult.rows;
    // =====================
    // GET FINAL BILL
    // =====================

    const billResult = await client.query(
        `
        SELECT *
        FROM bills
        WHERE bill_id = $1
      `,[billId]
      );
      const bill = billResult.rows[0];

    // =====================
    // CLOSE BILL
    // =====================

    await client.query(
      `
      UPDATE bills
      SET status = 'PAID'
      WHERE bill_id = $1
    `, [billId]
  );

    // =====================
    // FREE TABLE
    // =====================

    await client.query(
      `
      UPDATE tables
      SET
        status = 'AVAILABLE',
        current_bill_id = NULL
      WHERE table_number = $1
    `, [tableNumber]);

    // =====================
    // RESPONSE
    // =====================

    res.json({
      success: true,

      invoice: {
        bill,

        items: invoiceItems,
      },
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.get("/orders/:billId", async (req, res) => {
  try {
    const billId = req.params.billId;
    const orders = await client.query(
        `
      SELECT o.*, f.food_name, fo.option_name
      FROM orders o
      JOIN foods f ON o.food_id = f.food_id
      LEFT JOIN food_options fo ON o.option_id = fo.option_id
      WHERE o.bill_id = $1
    `,
      [billId]
    );

    res.json(orders.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err.message,
    });
  }
});

app.get("/bills/:billId", async (req, res) => {
  try {
    const billId = req.params.billId;

    const result = await client.query(
        `
      SELECT * FROM bills
      WHERE bill_id = $1
    `, [billId]);

    const bill = result.rows[0];
    const rows = bill;
    console.log(rows);
    res.json(rows);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.get("/tables", async (req, res) => {
  try {
    const result = await client.query(
        `
        SELECT * FROM tables
        ORDER BY
          CASE WHEN table_number LIKE 'P%' THEN 1 ELSE 0 END,
          CAST(REPLACE(table_number, 'P', '') AS INTEGER);
      `
      );
    const tables = result.rows;

    res.json(tables);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.get("/table-orders/:tableNumber", async (req, res) => {
  try {
    const { tableNumber } = req.params;

    const result = await client.query(
      `

          SELECT current_bill_id
          FROM tables
          WHERE table_number = $1
        `, [tableNumber]
      );

    const table = result.rows[0];

    if (!table || !table.current_bill_id) {
      return res.json({
        bill: null,
        orders: [],
      });
    }

    const bill = await client.query(
      `
          SELECT *
          FROM bills
          WHERE bill_id = $1
        `, [table.current_bill_id]
      )

    const orders = await client.query(
      `
          SELECT
            o.order_id,
            o.food_id,
            o.option_id,
            o.quantity,
            o.unit_price,
            o.total_price,
            f.food_name,
            fo.option_name
          FROM orders o
          JOIN foods f
            ON o.food_id =
               f.food_id
          LEFT JOIN food_options fo
            ON o.option_id =
               fo.option_id
          WHERE o.bill_id = $1
        `, [table.current_bill_id]
      );

    res.json({
      bill: bill.rows[0],
      orders: orders.rows,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.get("/bills-history", async (req, res) => {
  try {
    const bills = await client.query(`
      SELECT * FROM bills
      WHERE status = 'PAID'
    `);
    res.json(bills.rows);
  }
  catch(err){
    console.log(err);
    res.status(500).json({
      error: err.message,
    });
  } 
})
app.get("/bill-details/:billId", async (req, res) => {
  try{
    const {billId} = req.params;
    const billDetails = await client.query(`
      SELECT
        b.*,
        o.quantity,
        o.unit_price,
        o.total_price,
        f.food_name,
        fo.option_name
      FROM bills b
      JOIN orders o ON b.bill_id = o.bill_id
      JOIN foods f ON o.food_id = f.food_id
      LEFT JOIN food_options fo ON o.option_id = fo.option_id
      WHERE b.bill_id = $1
    `, [billId]);
    
    res.json(billDetails.rows);
  }
  catch(err){
    console.log(err);
    res.status(500).json({
      error: err.message,
    });
  } 
});


app.get("/check-table-status", async (req, res) => {
  try {

    let total = 0;
    const totalResult = await client.query(
      `
      SELECT t.table_number, b.total_cost
      FROM tables t
      INNER JOIN bills b ON b.bill_id = t.current_bill_id
      WHERE t.status = 'OCCUPIED';
      `);
    res.json(
      totalResult.rows,
    );
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.get("/bill-records", async (req, res) => {
  try {
    const BillDetailsResult = await client.query(
      `
      SELECT
          b.*,
          json_agg(
              json_build_object(
                  'order_id', o.order_id,
                  'food_name', f.food_name,
                  'quantity', o.quantity,
                  'unit_price', o.unit_price,
                  'total_price', o.total_price,
                  'option_name', COALESCE(fo.option_name, 'No Option')
              )
          ) AS orders
      FROM bills b
      LEFT JOIN orders o ON b.bill_id = o.bill_id
      LEFT JOIN foods f ON o.food_id = f.food_id
      LEFT JOIN food_options fo ON o.option_id = fo.option_id
      GROUP BY b.bill_id
      ORDER BY b.bill_id DESC;
      `
    )

    const billDetails = BillDetailsResult.rows;

    res.json({
      billDetails,
    })
  } catch (err) {
    console.log("ERROR FETCHING BILL RECORDS: ", err);
  }
})


app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
