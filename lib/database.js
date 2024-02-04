import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
const debugQuery = true;

function getDatabase(guildID) {
    // Convert from file URL to a path suitable for the OS
    const __dirname = path.dirname(fileURLToPath(import.meta.url));

    // Resolve the database path
    const dbPath = path.resolve(__dirname, `./${guildID}.db`);
    console.log(`Database path: ${dbPath}`)
    const db = new Database(dbPath, { verbose: console.log });
    return db;
}

export async function executeSQL(guildID, query) {
    if (!query) { return; }
    const db = getDatabase(guildID);

    const isSelectQuery = query.startsWith("SELECT");
    if (isSelectQuery) {
        const result = db.prepare(query).all();
        db.close();
        return result;
    } else {
        db.prepare(query).run();
    }
    db.close();
}

function escapeString(string) {
    if (typeof string !== 'string') { return null; }
    string = string.replace(/'/gm, "\\'");
    return string;
}

function sanitizeString(string) {
    string = string.replace(/[^a-zA-Z0-9\s\.,\?!'"]/g, "");
    string = string.replace("'", "\\'");
    string = string.replace('"', '\\"');
    return string;
}

export async function doSelect(guildID, table, values, { ...where } = {}, { ...options } = {}) {
    try {
        const whereKeys = Object.keys(where);
        const whereValues = whereKeys.map(key => where[key].value || where[key]);

        if (!table) { return; }

        const db = getDatabase(guildID);

        let query = (
            `SELECT ${options.unique ? "DISTINCT " : "" }${values.length < 1 ? " *" : values.join(", ")} ` +
            `FROM ${table}`
        );

        if (whereKeys.length > 0) {
            query += ` WHERE ${whereKeys.map(key => `${key}${where[key].operator || "="}?`).join(" AND ")}`;
        }

        if (debugQuery) { console.log(query); }
        const results = db.prepare(query).all(...whereValues);
        db.close();
        return results;
    } catch(e) {
        console.log("Error on select.", { e });
        return [];
    }
}

export async function doInsert(guildID, table, {...values } = {}) {
    try {
        const valuesKeys = Object.keys(values);
        const valuesValues = valuesKeys.map(key => values[key]);

        if (!table || valuesKeys.length <= 0) { return; }

        const db = getDatabase(guildID);

        let query = (
            `INSERT OR IGNORE INTO ${table}(${valuesKeys.join(",")}) ` +
            `VALUES(${new Array(valuesKeys.length).fill("?").join(",")})`
        );

        if (debugQuery) { console.log(query); }
        db.prepare(query).run(...valuesValues);
        db.close();
        return true;
    } catch(e) {
        console.log(e)
        return false;
    }
}

export async function doDelete(guildID, table, { ...where } = {}) {
    try {
        const whereKeys = Object.keys(where);
        const whereValues = whereKeys.map(key => where[key].value || where[key]);

        if (!table || whereKeys.length <= 0) { return; }

        const db = getDatabase(guildID);

        const query = (
            `DELETE FROM ${table} ` +
            `WHERE ${whereKeys.map(key => `${key}${where[key].operator || "="}?`).join(" AND ")}`
        );

        if (debugQuery) { console.log(query); }
        db.prepare(query).run(...whereValues);
        db.close();
        return true;
    } catch(e) {
        return false;
    }
}

export async function doUpdate(guildID, table, {...values } = {}, { ...where } = {}) {
    try {
        const valuesKeys = Object.keys(values);
        const valuesValues = valuesKeys.map(key => values[key]);
        const whereKeys = Object.keys(where);
        const whereValues = whereKeys.map(key => where[key].value || where[key]);

        if (!table || valuesKeys.length <= 0) { return; }

        const db = getDatabase(guildID);

        let query = (
            `UPDATE ${table} SET ` +
            `${valuesKeys.map(key => `${key}=?`).join(", ")}`
        );

        if (whereKeys.length > 0) {
            query += ` WHERE ${whereKeys.map(key => `${key}${where[key].operator || "="}?`).join(" AND ")}`;
        }

        if (debugQuery) { console.log(query); }
        db.prepare(query).run(...[...valuesValues, ...whereValues]);
        db.close();
        return true;
    } catch(e) {
        console.log(e)
        return false;
    }
}