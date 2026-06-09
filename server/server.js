import express from "express";
import Database from "better-sqlite3";
import cors from "cors";

const app = express();
const db = new Database("db/cafe.db");
const port = 5001;
app.use(cors());
app.use(express.json());

app.get("/categories", (req, res) => {
  const categories = db
    .prepare(
      `
        SELECT*FROM categories
        `,
    )
    .all();

  res.json(categories);
});
app.get("/foods", (req, res) => {
  const foods = db
    .prepare(
      `
        SELECT*FROM foods
        `,
    )
    .all();

  res.json(foods);
});
app.get("/food-options", (req, res) => {
  try {
    const foods = db
      .prepare(
        `
            SELECT*FROM food_options
            `,
      )
      .all();

    res.json(foods);
  } catch (error) {
    console.log(error);
  }
});

app.post("/kot", (req, res) => {
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

    const table = db
      .prepare(
        `
        SELECT *
        FROM tables
        WHERE table_number = ?
      `,
      )
      .get(tableNumber);

    if (!table) {
      return res.status(404).json({
        error: "Table not found",
      });
    }
    let billId = table.current_bill_id;

    if (customerName) {
      db.prepare(
        `
        UPDATE bills
        SET customer_name = ?
        WHERE bill_id = ?
      `,
      ).run(customerName, billId);
    }

    if (description) {
      db.prepare(
        `
        UPDATE bills
        SET description = ?
        WHERE bill_id = ?
      `,
      ).run(description, billId);
    }

    //create bill if not exists

    if (!billId) {
      const billResult = db
        .prepare(
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
            ?, ?, ?, ?,
            'ACTIVE',
            0,
            CURRENT_TIMESTAMP
          )
        `,
        )
        .run(tableNumber, customerName, description, parcel ? 1 : 0);

      billId = billResult.lastInsertRowid;

      db.prepare(
        `
        UPDATE tables
        SET
          status = 'OCCUPIED',
          current_bill_id = ?
        WHERE table_number = ?
      `,
      ).run(billId, tableNumber);
    }

    //insert order

    const insertOrder = db.prepare(`
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
          ?, ?, ?, ?, ?, ?,
          CURRENT_TIMESTAMP
        )
      `);

    let totalAdded = 0;

    for (const item of items) {
      insertOrder.run(
        item.food_id,

        billId,

        item.option_id,

        item.qty,

        item.price,

        item.finalPrice,
      );

      totalAdded += item.finalPrice;
    }

    //table transfer logic
    if (transferTable && transferTable !== tableNumber) {
      db.prepare(
        `
        UPDATE tables
        SET
          status = 'AVAILABLE',
          current_bill_id = NULL
        WHERE table_number = ?
      `,
      ).run(tableNumber);

      db.prepare(
        `
        UPDATE tables
        SET
          status = 'OCCUPIED',
          current_bill_id = ?
        WHERE table_number = ?
      `,
      ).run(billId, transferTable);

      db.prepare(
        `
        UPDATE bills
        SET table_number = ?
        WHERE bill_id = ?
      `,
      ).run(transferTable, billId);
    }
    //bill total update
    db.prepare(
      `
      UPDATE bills
      SET total_cost =
        total_cost + ?
      WHERE bill_id = ?
    `,
    ).run(totalAdded, billId);

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

app.post("/bill", (req, res) => {
  try {
    const { tableNumber, customerName, description, parcel, items } = req.body;

    // =====================
    // FIND ACTIVE BILL
    // =====================

    const table = db
      .prepare(
        `
        SELECT *
        FROM tables
        WHERE table_number = ?
      `,
      )
      .get(tableNumber);

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
      const billResult = db
        .prepare(
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
            ?, ?, ?, ?,
            'ACTIVE',
            0,
            CURRENT_TIMESTAMP
          )
        `,
        )
        .run(tableNumber, customerName, description, parcel ? 1 : 0);

      billId = billResult.lastInsertRowid;

      db.prepare(
        `
        UPDATE tables
        SET
          status = 'OCCUPIED',
          current_bill_id = ?
        WHERE table_number = ?
      `,
      ).run(billId, tableNumber);
    }

    // =====================
    // UPDATE CUSTOMER INFO
    // =====================

    if (customerName || description) {
      db.prepare(
        `
        UPDATE bills
        SET
          customer_name = ?,
          description = ?
        WHERE bill_id = ?
      `,
      ).run(customerName, description, billId);
    }

    // =====================
    // INSERT NEW ITEMS
    // =====================

    const newItems = items.filter((item) => item.isNew);

    const insertOrder = db.prepare(`
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
          ?, ?, ?, ?, ?, ?,
          CURRENT_TIMESTAMP
        )
      `);

    let addedTotal = 0;

    for (const item of newItems) {
      insertOrder.run(
        item.food_id,

        billId,

        item.option_id,

        item.qty,

        item.price,

        item.finalPrice,
      );

      addedTotal += item.finalPrice;
    }

    // =====================
    // UPDATE BILL TOTAL
    // =====================

    db.prepare(
      `
      UPDATE bills
      SET total_cost =
        total_cost + ?
      WHERE bill_id = ?
    `,
    ).run(addedTotal, billId);

    // =====================
    // GET INVOICE ITEMS
    // =====================

    const invoiceItems = db
      .prepare(
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
        WHERE o.bill_id = ?
      `,
      )
      .all(billId);

    // =====================
    // GET FINAL BILL
    // =====================

    const bill = db
      .prepare(
        `
        SELECT *
        FROM bills
        WHERE bill_id = ?
      `,
      )
      .get(billId);

    // =====================
    // CLOSE BILL
    // =====================

    db.prepare(
      `
      UPDATE bills
      SET status = 'PAID'
      WHERE bill_id = ?
    `,
    ).run(billId);

    // =====================
    // FREE TABLE
    // =====================

    db.prepare(
      `
      UPDATE tables
      SET
        status = 'AVAILABLE',
        current_bill_id = NULL
      WHERE table_number = ?
    `,
    ).run(tableNumber);

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

app.get("/orders/:billId", (req, res) => {
  try {
    const billId = req.params.billId;
    const orders = db
      .prepare(
        `
      SELECT o.*, f.food_name, fo.option_name
      FROM orders o
      JOIN foods f ON o.food_id = f.food_id
      LEFT JOIN food_options fo ON o.option_id = fo.option_id
      WHERE o.bill_id = ?
    `,
      )
      .all(billId);
    res.json(orders);
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

    const bill = db
      .prepare(
        `
      SELECT * FROM bills
      WHERE bill_id = ?
    `,
      )
      .all(billId);
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

app.get("/tables", (req, res) => {
  try {
    const tables = db
      .prepare(
        `
        SELECT * FROM tables
      `,
      )
      .all();

    res.json(tables);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.get("/table-orders/:tableNumber", (req, res) => {
  try {
    const { tableNumber } = req.params;

    const table = db
      .prepare(
        `
          SELECT current_bill_id
          FROM tables
          WHERE table_number = ?
        `,
      )
      .get(tableNumber);

    if (!table || !table.current_bill_id) {
      return res.json({
        bill: null,
        orders: [],
      });
    }

    const bill = db
      .prepare(
        `
          SELECT *
          FROM bills
          WHERE bill_id = ?
        `,
      )
      .get(table.current_bill_id);

    const orders = db
      .prepare(
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
          WHERE o.bill_id = ?
        `,
      )
      .all(table.current_bill_id);

    res.json({
      bill,
      orders,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
