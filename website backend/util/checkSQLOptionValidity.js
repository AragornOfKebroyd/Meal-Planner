const { db } = require('../controllers/databaseController')

const checkValidity = (options, tablename) => {
    const columns = db.pragma(`table_info(${tablename})`)
    const colnames = columns.map(col => col.name)
    const providedColumns = Object.keys(options)

    // check all provided column names are in the tables columns
    const truth = providedColumns.every(col => colnames.includes(col))
    return truth
}

const incorrectValus = (options, tablename) => {
    const columns = db.pragma(`table_info(${tablename})`)
    const colnames = columns.map(col => col.name)
    const providedColumns = Object.keys(options)

    // check all provided column names are in the tables columns
    const wrong = providedColumns.filter(col => !colnames.includes(col))
    return [wrong, colnames]
}

module.exports = { checkValidity, incorrectValus }