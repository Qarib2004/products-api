const jsonServer = require('json-server');
const bcrypt = require('bcryptjs');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 3000;

server.use(middlewares);
server.use(router);
server.use(jsonServer.bodyParser);

// Kullanıcı oluşturulurken şifreyi hash'leme işlemi
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

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
