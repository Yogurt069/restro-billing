import express from "express";
import Database from "better-sqlite3";
import cors from "cors";

const app = express();
const db = new Database("db/cafe.db");
const port =5000;
app.use(cors());
app.use(express.json());




app.get("/categories", (req,res) =>{
    const categories = db.prepare(`
        SELECT*FROM categories
        `).all();

    res.json(categories);
})
app.get("/foods", (req,res) =>{
    const foods = db.prepare(`
        SELECT*FROM foods
        `).all();

    res.json(foods);
})
app.get("/food-options", (req,res) =>{
    try {
        const foods = db.prepare(`
            SELECT*FROM food_options
            `).all();
    
        res.json(foods);
        
    } catch (error) {
        console.log(error)
    }
})

app.post("/kot", (req, res) => {

  try {

    const {

      table_number,
      customer_name,
      description,
      parcel,
      total_cost,
      items

    } = req.body;

    const tableInfo = 
        db.prepare(`
                UPDATE tables
                SET status = 'Available'
                WHERE table_number = ?
            `).run(
                [Number(table_number)]
            )

    // =====================
    // INSERT BILL
    // =====================

    const billResult =
      db.prepare(`

        INSERT INTO bills
        (
          table_number,
          customer_name,
          description,
          parcel,
          status,
          total_cost,
          created_at
        )

        VALUES (?, ?, ?, ?, ?, ?, ?)

      `).run(

        Number(table_number),

        customer_name || null,

        description || null,

        parcel ? 1 : 0,

        "ACTIVE",

        Number(total_cost),

        new Date().toISOString()

      );

    // =====================
    // BILL ID
    // =====================

    const billId =
      billResult.lastInsertRowid;

    // =====================
    // PREPARE ORDER INSERT
    // =====================
    
    const insertOrder =
      db.prepare(`

        INSERT INTO orders
        (
          food_id,
          bill_id,
          option_id,
          quantity,
          unit_price,
          total_price,
          created_at
        )

        VALUES (?, ?, ?, ?, ?, ?, ?)

      `);

    // =====================
    // INSERT ALL ITEMS
    // =====================

    items.forEach((item) => {

      console.log(item);

      insertOrder.run(

        Number(item.food_id),

        Number(billId),

        item.option_id
          ? Number(item.option_id)
          : null,

        Number(item.qty),

        Number(item.finalPrice)/Number(item.qty),
        Number(item.finalPrice),
        

        new Date().toISOString()

      );

    });

    // =====================
    // RESPONSE
    // =====================

    res.json({

      success: true,

      bill_id: billId

    });

  }

  catch (err) {

    console.log(err);

    res.status(500).json({

      error: err.message

    });

  }

});

app.post("/bills", (req, res) => {

  try {

    const {

      table_number,
      customer_name,
      description,
      parcel,
      total_cost,
      items

    } = req.body;

    const tableInfo = 
        db.prepare(`
                UPDATE tables
                SET status = 'Available'
                WHERE table_number = ?
            `).run(
                [Number(table_number)]
            )

    // =====================
    // INSERT BILL
    // =====================

    const billResult =
      db.prepare(`

        INSERT INTO bills
        (
          table_number,
          customer_name,
          description,
          parcel,
          status,
          total_cost,
          created_at
        )

        VALUES (?, ?, ?, ?, ?, ?, ?)

      `).run(

        Number(table_number),

        customer_name || null,

        description || null,

        parcel ? 1 : 0,

        "ACTIVE",

        Number(total_cost),

        new Date().toISOString()

      );

    // =====================
    // BILL ID
    // =====================

    const billId =
      billResult.lastInsertRowid;

    // =====================
    // PREPARE ORDER INSERT
    // =====================
    
    const insertOrder =
      db.prepare(`

        INSERT INTO orders
        (
          food_id,
          bill_id,
          option_id,
          quantity,
          unit_price,
          total_price,
          created_at
        )

        VALUES (?, ?, ?, ?, ?, ?, ?)

      `);

    // =====================
    // INSERT ALL ITEMS
    // =====================

    items.forEach((item) => {

      console.log(item);

      insertOrder.run(

        Number(item.food_id),

        Number(billId),

        item.option_id
          ? Number(item.option_id)
          : null,

        Number(item.qty),

        Number(item.finalPrice)/Number(item.qty),
        Number(item.finalPrice),
        

        new Date().toISOString()

      );

    });

    // =====================
    // RESPONSE
    // =====================

    res.json({

      success: true,

      bill_id: billId

    });

  }

  catch (err) {

    console.log(err);

    res.status(500).json({

      error: err.message

    });

  }

});


app.get("/tables", (req, res) => {

  try {

    const tables =
      db.prepare(`
        SELECT * FROM tables
      `).all();

    res.json(tables);

  }

  catch (err) {

    console.log(err);

    res.status(500).json({

      error: err.message

    });

  }

});

app.listen(port, ()=>{
    console.log(`server is running on port ${port}`)
})