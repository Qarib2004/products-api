const jsonServer = require('json-server');
const bcrypt = require('bcryptjs');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 3000;

server.use(middlewares);
server.use(router);
server.use(jsonServer.bodyParser);

server.post('/users', async (req, res, next) => {
  if (req.body.password) {
    const saltRounds = 10;
    req.body.password = await bcrypt.hash(req.body.password, saltRounds);
  }
  next(); // JSON Server'ın normal işlemesine devam et
});

server.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const users = router.db.get('users').value(); // db.json'daki users listesi

  const user = users.find((u) => u.email === email);
  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({ message: 'Giriş başarılı', user });
  } else {
    res.status(401).json({ message: 'Geçersiz email veya şifre' });
  }
});


server.listen(port);
