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

con.query('SELECT * FROM users')
  .then(result => {
    console.log('Пользователи:', result.rows);
  })
  .catch(err => {
    console.error('Ошибка при получении пользователей', err);
});