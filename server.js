const jsonServer = require('json-server');
const bcrypt = require('bcryptjs');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 3000;

server.use(middlewares);
server.use(router);
server.use(jsonServer.bodyParser);

// Yeni kullanıcı oluşturulurken şifreyi hash'leme işlemi
server.post('/users', async (req, res, next) => {
  if (req.body.password) {
    const saltRounds = 10;
    try {
      // Şifreyi hash'leyelim
      req.body.password = await bcrypt.hash(req.body.password, saltRounds);
      console.log('Hashed Password:', req.body.password); // Hash'lenmiş şifreyi konsola yazdır
    } catch (error) {
      console.error('Hashing error:', error);
      return res.status(500).json({ message: 'Error hashing password' });
    }
  }
  next(); // JSON Server'ın normal işlemesine devam et
});

// Kullanıcı giriş işlemi
server.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const users = router.db.get('users').value(); // db.json'daki users listesi

  const user = users.find((u) => u.email === email);
  if (user) {
    // Hash'lenmiş şifreyi karşılaştıralım
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (isPasswordCorrect) {
      res.status(200).json({ message: 'Giriş başarılı', user });
    } else {
      res.status(401).json({ message: 'Geçersiz email veya şifre' });
    }
  } else {
    res.status(401).json({ message: 'Geçersiz email veya şifre' });
  }
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
