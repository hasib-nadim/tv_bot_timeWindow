const express = require("express");
const { createDB, insert,last5, getLast } = require("./query");
const app = express();
const port = 3000;
app.use(express.urlencoded({ extended: true }), express.json());
app.set("view engine", "ejs");

api = express.Router();
app.use("/api", api);

//
app.get("/", async (req, res) => {
  try {
    const data = await last5();
    res.render("index", { data: data });
  } catch (error) {
    console.log(error);
    res.render("index", { data: [] });
  }
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

api.get("/list",async (req, res) => {
  try {
    const data = await last5();
    let _ = data.map((d) => (`${Date.parse(d.created)}_${d.text}`));
    res.json(_);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
api.get("/view",async (req, res) => {
  try {
    const data = await getLast();
    res.send(`${Date.parse(data.created)}_${data.text}`);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
api.get("/docs", (req, res) => {
  res.send(`
    GET: / - get last 5 alerts as html <br>
    GET: /api/list - get last 5 alerts as json <br>
    GET: /api/view - get last alert as json <br>
    GET: /api/send?txt="SOMETHING" - send custom alert <br>
    POST: /api - send TV alert <br>
    `)
})
app.listen(port, () => {
  createDB();
  console.log(`Example app listening at http://localhost:${port}`);
});
