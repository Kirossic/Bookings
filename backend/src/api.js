const express = require('express');
const app = express();
app.use(express.json());
const { errorHandler } = require('../../middleware/errorHandler.js');

const indexRouter = require('./routes/index.js');
app.use('/api', indexRouter);

app.use(errorHandler);
module.exports = app;