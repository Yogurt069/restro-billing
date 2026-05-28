import Database from "better-sqlite3";
import express, { application } from "express";

try {
    const db = new Database("cafe.db");
    db.pragma("foreign_keys = ON");
    db.exec(`
        CREATE TABLE IF NOT EXISTS bills(
        bill_id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_number INTEGER,
        customer_name VARCHAR(45),
        description TEXT,
        parcel BOOLEAN DEFAULT FALSE,
        status TEXT,
        total_cost INTEGER,
        created_at TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS categories(
        category_id INTEGER PRIMARY KEY,
        category_name varchar(15)
    );
    CREATE TABLE IF NOT EXISTS foods(
        food_id INTEGER PRIMARY KEY,
        food_name VARCHAR(45),
        category_id INTEGER REFERENCES categories(category_id),
        food_description VARCHAR(60),
        price INTEGER
    );
    CREATE TABLE IF NOT EXISTS food_options(
        option_id INTEGER PRIMARY KEY,
        option_name varchar(15),
        category_id INTEGER REFERENCES categories(category_id),
        extra_price INTEGER
    );
    CREATE TABLE IF NOT EXISTS tables(
        table_number INTEGER PRIMARY KEY,
        status TEXT,
        current_bill_id INTEGER REFERENCES bills(bill_id)
    );
    CREATE TABLE IF NOT EXISTS orders(
        order_id INTEGER PRIMARY KEY AUTOINCREMENT,
        food_id INTEGER REFERENCES foods(food_id),
        bill_id INTEGER REFERENCES bills(bill_id),
        option_id INTEGER REFERENCES food_options(option_id),
        quantity INTEGER,
        unit_price INTEGER,
        total_price INTEGER,
        created_at TIMESTAMP
    );
    `)

    console.log("sucess")
    } catch (error) {
        console.log(error)
    }