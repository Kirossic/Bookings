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

// con.query('INSERT INTO resources (name, type, description, price_per_hour, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
//     ['Laungi Номер', 'Отель', 'Роскошный номер с видом на море', 100.00, 'Свободен'])
//   .then(result => {
//     console.log('Добавленный ресурс:', result.rows[0]);
//   })
//   .catch(err => {
//     console.error('Ошибка при добавлении ресурса', err);
// });
/*
con.query('UPDATE resources SET status = $1 WHERE id = $2 RETURNING *', ['Свободен', 3])
  .then(result => {
    console.log('Обновленный ресурс:', result.rows[0]);
  })
  .catch(err => {
    console.error('Ошибка при обновлении ресурса', err);
  });
*/