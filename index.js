const express = require("express");
const { createDB, insert,getAll,last5, getLast } = require("./query");
const app = express();
const port = 80;
app.use(express.text(),express.urlencoded({ extended: true }), express.json());
app.set("view engine", "ejs");

api = express.Router();
app.use("/api", api);

const alerts = []; // only last 5 alerts

app.get("/ripiknnapuxxf22__ha_ha_ha/snd", async (req, res) => {
	const txt = req.query?.txt || ""
	alerts.push(Date.now() + "+" + txt); 
    
    if (alerts.length > 125) {
        alerts.shift();
    }
    res.end();
});
app.get("/ripiknnapuxxf22__ha_ha_ha/history", async (req, res) => { 
    const html = `
    <html>
        <head>
            <title>History</title>
        </head>
        <body>
            <h1>History</h1>
            <table border="1">
                <tr>
                    <th>Timestamp</th>
                    <th>Alert</th>
                </tr>
                ${alerts.map((a) => `<tr><td>${(new Date(Number(a.split("+")[0]))).toLocaleString()}</td><td>${a.split("+")[1]}</td></tr>`).join("")}
            </table>
        </body>
    </html>
    `;

    res.send(html);
});

app.get("/ripiknnapuxxf22__ha_ha_ha", async (req, res) => {
res.json(alerts.slice(-5));
});

app.post("/ripiknnapuxxf22__ha_ha_ha", (req, res) => {
    const txt = req.body || "";
    alerts.push(Date.now() + "+" + txt); 
    if (alerts.length > 125) {
        alerts.shift();
    }
    res.end();
});

//
app.get("/", async (req, res) => {
  try {
    const data = await getAll();
    res.render("index", { data: data });
  } catch (error) {
    console.log(error);
    res.render("index", { data: [] });
  }
});


const fs = require('fs');
if (!fs.existsSync('pair.json')) {
  fs.writeFileSync('pair.json', JSON.stringify({}));
}
var jsonData = JSON.parse(fs.readFileSync('pair.json'));
api.all("/set_pair", (req, res) => {
  const pair = Object.keys(req.query)[0];
  const value = Boolean(parseInt(req.query[pair]));
  jsonData[pair] = value;
  fs.writeFileSync('pair.json', JSON.stringify(jsonData));
  res.end();
});
api.get("/get_pair/:pair", (req, res) => {
  const pair = req.params.pair;
  res.send({
    [pair]: Boolean(jsonData[pair])
  });
})


if (!fs.existsSync('pair_cycle.json')) {
  fs.writeFileSync('pair_cycle.json', JSON.stringify({}));
}
var jsonData2 = JSON.parse(fs.readFileSync('pair_cycle.json'));
api.all("/set_cycle", (req, res) => {
  const pair = Object.keys(req.query)[0];
  const value = parseInt(req.query[pair]);
  jsonData2[pair] = value;
  fs.writeFileSync('pair_cycle.json', JSON.stringify(jsonData2));
  res.end();
});
api.get("/get_cycle/:pair", (req, res) => {
  const pair = req.params.pair;
  res.send({
    [pair]: jsonData2[pair] || 0
  });
})


if (!fs.existsSync('pair_flag.json')) {
  fs.writeFileSync('pair_flag.json', JSON.stringify({}));
}
var jsonData3 = JSON.parse(fs.readFileSync('pair_flag.json'));
api.all("/set_flag", (req, res) => {
  const pair = Object.keys(req.query)[0];
  const value = Boolean(parseInt(req.query[pair]));
  jsonData3[pair] = value;
  fs.writeFileSync('pair_flag.json', JSON.stringify(jsonData3));
  res.end();
});
api.get("/get_flag/:pair", (req, res) => {
  const pair = req.params.pair;
  res.send({
    [pair]: Boolean(jsonData3[pair])
  });
})

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
    let _ = data.map((d) => (`${Date.parse(d.created)}+${d.text}`));
    res.json(_);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
api.get("/view",async (req, res) => {
  try {
    const data = await getLast();
    res.send(`${Date.parse(data.created)}+${data.text}`);
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
    ALL: /api/set_pair?[pair]=0,1 - set value <br>
    GET: /api/get_pair/[pair] - get value <br>
    ALL: /api/set_cycle?[pair]=0,1,2,3,4,... - set value <br>
    GET: /api/get_cycle/[pair] - get value <br>
    ALL: /api/set_flag?[pair]=0,1 - set value <br>
    GET: /api/get_flag/[pair] - get value <br>
    POST: /api - send TV alert <br>
    `)
})
app.listen(port, () => {
  createDB();
  console.log(`Example app listening at http://localhost:${port}`);
});
