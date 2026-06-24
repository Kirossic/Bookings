// middleware/validators.js

const validators = {
  // Валидация email
  email: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  // Валидация id (положительное целое число)
  id: (id) => {
    const num = parseInt(id, 10);
    return !isNaN(num) && num > 0;
  },

  // Валидация user_id (положительное целое число)
  user_id: (user_id) => {
    const num = parseInt(user_id, 10);
    return !isNaN(num) && num > 0;
  },

  // Валидация resource_id (положительное целое число)
  resource_id: (resource_id) => {
    const num = parseInt(resource_id, 10);
    return !isNaN(num) && num > 0;
  },

  // Валидация role_id (положительное целое число)
  role_id: (role_id) => {
    const num = parseInt(role_id, 10);
    return !isNaN(num) && num > 0;
  },

  // Валидация пароля (минимум 8 символов)
  password: (password) => {
    return password && password.length >= 8;
  },

  // Валидация имени (не пусто, не короче 1 символа)
  name: (name) => {
    return name && name.length >= 1 && name.length <= 100;
  },

  // Валидация цены (число > 0)
  price: (price) => {
    const num = parseFloat(price);
    return !isNaN(num) && num > 0;
  },

  // Валидация дат
  date: (date) => {
    return !isNaN(Date.parse(date));
  },

  // Валидация диапазона дат
  dateRange: (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return start < end;
  },
};

// Middleware для проверки регистрации/обновления пользователя
const validateRegister = (req, res, next) => {
  const normalize = (val) => {
    if (val === undefined || val === null) return undefined;
    if (typeof val === 'string' && val.trim() === '') return undefined;
    return val;
  };

  const name = normalize(req.body.name);
  const email = normalize(req.body.email);
  const password = normalize(req.body.password);
  const role_id = normalize(req.body.role_id);
  const isPatch = req.method === 'PATCH';

  // PATCH запрос: проверяем только переданные поля
  if (isPatch) {
    const hasAnyField =
      name !== undefined || email !== undefined || password !== undefined || role_id !== undefined;
    if (!hasAnyField) {
      return res.status(400).json({ error: 'Не указаны поля для обновления' });
    }

    if (name !== undefined && !validators.name(name)) {
      return res.status(400).json({ error: 'Invalid name (1-100 characters)' });
    }

    if (email !== undefined && !validators.email(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password !== undefined && !validators.password(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    if (role_id !== undefined && !validators.role_id(role_id)) {
      return res.status(400).json({ error: 'Invalid role id' });
    }

    return next();
  }

  // POST запросы: требуем все поля
  if (!name || !validators.name(name)) {
    return res.status(400).json({ error: 'Invalid name (1-100 characters)' });
  }

  if (!email || !validators.email(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (!password || !validators.password(password)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  next();
};

// Middleware для проверки ресурса
const validateResource = (req, res, next) => {
  const { name, price_per_hour } = req.body;

  // Для PATCH запросов проверяем только переданные поля
  if (name !== undefined && !validators.name(name)) {
    return res.status(400).json({ error: 'Invalid resource name' });
  }

  if (price_per_hour !== undefined && !validators.price(price_per_hour)) {
    return res.status(400).json({ error: 'Invalid price (must be > 0)' });
  }

  next();
};

// Middleware для проверки бронирования
const validateBooking = (req, res, next) => {
  const { start_time, end_time } = req.body;

  if (!validators.date(start_time) || !validators.date(end_time)) {
    return res.status(400).json({ error: 'Invalid date format' });
  }

  if (!validators.dateRange(start_time, end_time)) {
    return res.status(400).json({ error: 'Start time must be before end time' });
  }

  next();
};

module.exports = {
  validators,
  validateRegister,
  validateResource,
  validateBooking,
};
