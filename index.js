const express = require("express");
const path = require("path");
var jwt = require("jsonwebtoken");
var cookieParser = require("cookie-parser");
const {
  createDB,
  insert,
  getAll,
  last5,
  getLast,
  findAdmin,
  getUsers,
  expiredKeys,
  addNewUser,
  extendKeyDate,
  getUser,
  hasAccessKey,
} = require("./query");
const { hashSync } = require("bcrypt");
const { randomUUID } = require("crypto");
const app = express();
const port = 80;
app.use(express.text(), express.urlencoded({ extended: true }), express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(cookieParser());

api = express.Router();
const jwtSecret = "secretNOTTOBEEXPOSED";

function checkAuth(req, res, next) {
  const token = req.cookies.authorization;
  if (token) {
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        res.redirect("/login");
      } else {
        req.user = decoded;
        next();
      }
    });
  } else {
    res.redirect("/login");
  }
}

app.get("/", checkAuth, async (req, res) => {
  const userList = await getUsers();
  const _expiredKeys = await expiredKeys();
  res.render("admin/dashboard", { userList, expiredKeys: _expiredKeys });
});

app.get("/login", (req, res) => {
  res.render("admin/login");
});
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await findAdmin(email, password);
  if (user) {
    const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: "1h" });
    res
      .cookie("authorization", token, {
        expires: new Date(Date.now() + 60 * 60 * 1000),
      })
      .redirect("/");
  } else {
    res.redirect("/login", { error: "Invalid email or password" });
  }
});
app.get("/users", checkAuth, async (req, res) => {
  const userList = await getUsers();
  res.render("admin/user_list", { userList });
});
app.get("/add_user", checkAuth, (req, res) => {
  res.render("admin/user_form");
});
app.post("/add_user", checkAuth, async (req, res) => {
  const { name, email, password, expires } = req.body;
  try {
    const formateDate = new Date(expires).toISOString();
    await addNewUser({
      name,
      email,
      password: hashSync(password, 10),
      expires: formateDate,
      api_key: randomUUID(),
    });
    res.redirect("/users");
  } catch (error) {
    console.log(error);
    res.render("admin/user_form", { error: error.message });
  }
});
app.get("/profile", checkAuth, async (req, res) => {
  const user = await getUser(req.user.id);

  res.render("admin/profile", { user });
});
app.put("/extend/:id", checkAuth, async (req, res) => {
  const { id } = req.params;
  const { expires } = req.body;
  const formateDate = new Date(expires).toISOString();
  try {
    await extendKeyDate(id, formateDate);
    res.json({ message: "Updated successfully!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
app.get("/logout", checkAuth, (req, res) => {
  res.clearCookie("authorization").redirect("/login");
});

app.use("/api", api);
api.get("/verify/:api_key", async (req, res) => {
  const { api_key } = req.params;
  const isOk = await hasAccessKey(api_key);
  res.json(isOk);
});

api.post("/", (req, res) => {
  const txt = req.body || "";
  insert(txt);
  res.end();
});

api.get("/send", (req, res) => {
  const txt = req.query?.txt || "";
  insert(txt);
  res.end();
});

api.get("/last", async (req, res) => {
  try {
    const data = await getLast();
    res.send(`${Date.parse(data.created)}+${data.text}`);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

api.get("/last5", async (req, res) => {
  try {
    const data = await last5();
    let _ = data.map((d) => `${Date.parse(d.created)}+${d.text}`);
    res.json(_);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

api.get("/html_history", async (req, res) => {
  const alerts = await getAll();
  res.render("index", { data: alerts });
});

api.get("/docs", (req, res) => {
  res.send(` 
    GET: /api/last - get last alert as string <br>
    GET: /api/last5 - get last 5 alerts as json <br>
    GET: /api/html_history - last 1000 alerts in table by descending order of creation <br>
    GET: /api/send?txt="SOMETHING" - send custom alert <br>
    GET: /api/verify/:api_key - verify api_key is valid or not <br>
    POST: /api - send TV alert <br>
    `);
});
app.listen(port, () => {
  createDB();
  console.log(`Example app listening at http://localhost:${port}`);
});
