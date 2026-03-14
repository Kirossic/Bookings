const con = require('../db/db.js');

async function buildRead(table, id) {
    const query = `SELECT * FROM ${table} WHERE id = $1`;
    const values = [id];
    return await con.query(query, values);
}

async function buildUpdate(table, id, data, allowed = []) {
    const updates = [];
    const values = [];
    let index = 1;

    for (const key in data) {
        if (!allowed.includes(key)) continue; 
        updates.push(`${key} = $${index++}`);
        values.push(data[key]);
    }
    if (updates.length === 0) {
        return null;
    }
    const query = `UPDATE ${table} SET ${updates.join(', ')} WHERE id = $${index} RETURNING *`;
    values.push(id);
    return await con.query(query, values);
}

async function buildDelete(table, id) {
    const query = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
    const values = [id];
    return await con.query(query, values);
}

module.exports = { buildRead, buildUpdate, buildDelete };