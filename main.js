const express = require('express');
const app = express();
app.use(express.json());
const con = require('./db_local/db.js');

con.query('SELECT * FROM users')
  .then(result => {
    console.log('Последний пользователь:', result.rows[result.rows.length - 1]);
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
//Удаление брони и обновление статуса ресурса
con.query('UPDATE resources SET status = $1 WHERE id = $2 RETURNING *', ['Свободен', 3])
  .then(result => {
    con.query('DELETE FROM bookings WHERE resource_id = $1 RETURNING *', [3])
      .then(bookingResult => {
        console.log('Удаленные бронирования:', bookingResult.rows);
      })
      .catch(err => {
        console.error('Ошибка при удалении бронирований', err);
      });
    console.log('Обновленный ресурс:', result.rows[0]);
  })
  .catch(err => {
    console.error('Ошибка при обновлении ресурса', err);
  });
*/
/*
con.query('DELETE FROM bookings WHERE id = $1 RETURNING *', [7])
  .then(result => {
    console.log('Удаленный ресурс:', result.rows[0]);
  })
  .catch(err => {
    console.error('Ошибка при удалении ресурса', err);
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
*/