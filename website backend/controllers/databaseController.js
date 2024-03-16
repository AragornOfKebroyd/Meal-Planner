const DATABASE = process.env.DATABASE
const db = require('better-sqlite3')(`./database/${DATABASE}.db`)
db.pragma('journal_mode = WAL') // performance
// https://github.com/WiseLibs/better-sqlite3/blob/HEAD/docs/api.md#class-statement

const queryOne = (SQL, params) => {
    const stmt = db.prepare(SQL);
    if (!params) {
        const info = stmt.get()
        return info
    } else {
        const info = stmt.get(...params)
        return info
    }
}

const query = (SQL, params) => {
    const stmt = db.prepare(SQL);
    if (!params) {
        const info = stmt.all()
        return info
    } else {
        const info = stmt.all(...params)
        return info
    }
}

const execute = (SQL, params) => {
    const stmt = db.prepare(SQL);
    if (!params) {
        const info = stmt.run()
        return info
    } else {
        const info = stmt.run(...params)
        return info
    }
}

process.on('exit', () => db.close())

module.exports = {
    db,
    query,
    queryOne,
    execute
}