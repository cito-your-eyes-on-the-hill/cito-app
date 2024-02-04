const sqlite3 = require('sqlite3').verbose();

let name = 'citoData.db';
// Assuming 'name' is defined somewhere above; otherwise, you need to define it
let db = new sqlite3.Database(`./${name}`, (err) => {
    if (err) {
        console.error(err.message);
    }
});

db.serialize(() => {
    db.run("BEGIN TRANSACTION;");

    // Adjusted queries for creating tables go here
    // For example:
    db.run(`
        CREATE TABLE IF NOT EXISTS Articles (
            ArticleID INTEGER PRIMARY KEY AUTOINCREMENT,
            Title TEXT,
            Text TEXT,
            Summary TEXT,
            AuthorName TEXT,
            Date TEXT,
            ImageData BLOB,
            ClassifierNumber INTEGER,
            WebsiteName TEXT,
            ZipCode TEXT,
            FOREIGN KEY (ZipCode) REFERENCES ZipCodes(ZipCode)
        );`
    );

    // Add other table creation queries here...

    db.run("COMMIT;", (err) => {
        if (err) {
            console.error(err.message);
            db.run("ROLLBACK;");
        } else {
            console.log('Tables created successfully.');
        }
    });
});

// Close the database connection
db.close((err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Closed the database connection.');
    }
});
