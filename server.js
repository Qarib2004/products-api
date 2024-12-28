const jsonServer = require('json-server');
const bcrypt = require('bcryptjs');
const server = jsonServer.create();
const router = jsonServer.router('db.json'); // JSON veritabanı
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Kullanıcı kaydı sırasında şifreyi hashlemek için middleware
server.post('/users', async (req, res, next) => {
  try {
    if (req.body.password) {
      const saltRounds = 10;
      req.body.password = await bcrypt.hash(req.body.password, saltRounds); // Şifreyi hashle
      console.log(req.body.password);
    }
    next(); // JSON Server'ın varsayılan işlemini devam ettir
  } catch (error) {
    console.error('Şifre hashleme hatası:', error);
    res.status(500).json({ error: 'Şifre hashlenemedi' });
  }
});

// Kullanıcı girişini doğrulamak için endpoint
server.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const users = router.db.get('users').value(); // JSON'daki kullanıcıları alın

  const user = users.find((u) => u.email === email);
  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({ message: 'Giriş başarılı', user });
  } else {
    res.status(401).json({ message: 'Geçersiz email veya şifre' });
  }
});

// JSON Server'ı çalıştır
server.use(router);

server.listen(3000, () => {
  console.log('JSON Server is running on http://localhost:3000');
});
