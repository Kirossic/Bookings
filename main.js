const express = require('express');
const app = express();
app.use(express.json());
const con = require('./db_local/db.js');

con.query("SELECT * FROM demo").then((res) => {
    console.log(res.rows);
}).catch(err => {
    console.error('Error executing query', err);
}).finally(() => {
});

/*
con.query('INSERT INTO demo  (id, name) VALUES ($1, $2)', [1, 'Ivan'])
  .then(res => {
    console.log('Пользователь добавлен');
  })
  .catch(err => {
    console.error('Ошибка при добавлении пользователя', err);
});
con.query('DELETE FROM demo WHERE id = $1', [1])
*/
con.query('DELETE FROM users WHERE id = $1', [2])
con.query('SELECT * FROM users')
  .then(result => {
    console.log('Пользователи:', result.rows);
  })
  .catch(err => {
    console.error('Ошибка при получении пользователей', err);
});