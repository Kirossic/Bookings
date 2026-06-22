const con = require('../db/db.js');

async function buildWhiteList(table) {
    const isVerifiedName = /^[a-zA-Z0-9_]+$/;
    if (!isVerifiedName.test(table)) {
        throw new Error(`400: Недопустимое имя таблицы ${table} для белого списка`);
    }

    const query = `SELECT column_name FROM information_schema.columns WHERE table_name = $1`;
    const values = [table];
    const result = await con.query(query, values);
    if (result.rowCount === 0) {
        throw new Error(`404: Таблица ${table} не найдена`);
    }

    return result.rows.map(row => row.column_name);
}

async function buildRead(table, id) {
    await buildWhiteList(table);

    const query = `SELECT * FROM ${table} WHERE id = $1`;
    const values = [id];
    return await con.query(query, values);
}

async function buildUpdate(table, id, data) {
    const allowed = await buildWhiteList(table);

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
    await buildWhiteList(table);

    const query = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
    const values = [id];
    return await con.query(query, values);
}

module.exports = { buildWhiteList, buildRead, buildUpdate, buildDelete };