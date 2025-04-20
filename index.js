const express = require("express");
const { createDB, insert, getAll, last5, getLast } = require("./query");
const app = express();
const port = 80;
app.use(express.text(), express.urlencoded({ extended: true }), express.json());
app.set("view engine", "ejs");

api = express.Router();
app.use("/api", api);

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
    POST: /api - send TV alert <br>
    `);
});
app.listen(port, () => {
  createDB();
  console.log(`Example app listening at http://localhost:${port}`);
});
