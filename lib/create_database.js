import sqlite3 from 'sqlite3';

// Change name or path if wrong
let db = new sqlite3.Database(`./database/${name}`, (err) => {
    if (err) {
        console.error(err.message);
    }
});
db.serialize(() => {
    db.run("BEGIN TRANSACTION;");

    // Query to create the 'events' table
    db.run(`
                    CREATE TABLE IF NOT EXISTS events (
                        eventUniqueID TEXT PRIMARY KEY,
                        eventTitle TEXT UNIQUE NOT NULL,
                        submissionChannelID TEXT,
                        submissionMessageID TEXT,
                        clipsChannelID TEXT,
                        endTime INTEGER,
                        rewardRole TEXT,
                        eventRole TEXT,
                        eventEnded BOOLEAN DEFAULT 0
                    );`
    );

    // Query to create the 'endedEvents' table
    db.run(`
                    CREATE TABLE IF NOT EXISTS endedEvents (
                        eventUniqueID TEXT PRIMARY KEY,
                        eventTitle TEXT UNIQUE NOT NULL,
                        submissionChannelID TEXT,
                        submissionMessageID TEXT,
                        clipsChannelID TEXT,
                        endTime INTEGER,
                        rewardRole TEXT,
                        eventRole TEXT,
                        eventEnded BOOLEAN DEFAULT 0
                    );`
    );

    // Query to create the 'defaultChannels' table
    db.run(`
                    CREATE TABLE IF NOT EXISTS defaultChannels (
                        defaultChannel TEXT,
                        defaultCategory TEXT
                    );`
    );

    db.run(`
                    CREATE TABLE IF NOT EXISTS votes (
                        eventUniqueID TEXT,
                        userID TEXT,
                        voteMessageID TEXT,
                        voteChannelID TEXT,
                        submissionMessageID TEXT
                    );`
    );

    db.run(`
                    CREATE TABLE IF NOT EXISTS submissions (
                        eventUniqueID TEXT,
                        userID TEXT,
                        messageTextID TEXT PRIMARY KEY,
                        messageChannelID TEXT,
                        voteButtonMessageID TEXT
                    );`
    );


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