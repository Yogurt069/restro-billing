import XLSX from "xlsx";
import Database from "better-sqlite3";

const db = new Database("cafe.db");
db.pragma("foreign_keys = ON");

try {
        
    const workbook = XLSX.readFile("menu.xlsx");
        
    const categoriesSheet = workbook.Sheets["categories"];
    const foodsSheet = workbook.Sheets["foods"];
    const foodOptionSheet = workbook.Sheets["food_options"];

    const categories = XLSX.utils.sheet_to_json(categoriesSheet);
    const foods = XLSX.utils.sheet_to_json(foodsSheet);
    const foodOptions = XLSX.utils.sheet_to_json(foodOptionSheet);

    categories.forEach((category)=>{
        db.prepare(`
            INSERT INTO categories(
                category_id,
                category_name
            )VALUES(?,?)
            `).run(
                category.category_id,
                category.category_name
            )
    });
    foods.forEach((food)=>{
        db.prepare(`
            INSERT INTO foods(
                food_id,
                food_name,
                category_id,
                food_description,
                price
            )VALUES(?,?,?,?,?)
            `).run(
                food.food_id,
                food.food_name,
                food.category_id,
                food.food_description,
                food.price
            )
    });
    foodOptions.forEach((foodOption)=>{
        db.prepare(`
            INSERT INTO food_options(
                option_id,
                option_name,
                category_id,
                extra_price
            )VALUES(?,?,?,?)
            `).run(
                foodOption.option_id,         
                foodOption.option_name,
                foodOption.category_id,
                foodOption.extra_price
            )
        });

    db.prepare(`
            INSERT INTO tables
            (table_number, status)

            VALUES
            (1, 'AVAILABLE'),
            (2, 'AVAILABLE'),
            (3, 'AVAILABLE'),
            (4, 'AVAILABLE');
        `).run()
        
        console.log("imported succesfully")
} catch (error) {
    console.log(error)
}