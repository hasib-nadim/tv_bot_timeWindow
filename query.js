const sqlite3 = require("sqlite3").verbose();
const dbName = "alerts.db";
let db_reader = new sqlite3.Database(dbName);
function createDB() {
  let db = new sqlite3.Database(dbName);
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT,
            created DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
  });

  db.close();
}
function insert(text) {
  let db = new sqlite3.Database(dbName);
  db.serialize(() => {
    db.run(`INSERT INTO alerts(text) VALUES (?)`, [text]);
  });

  db.close();
}
function getLast() {
  return new Promise((resolve, reject) => {
    db_reader.serialize(() => {
      db_reader.all(
        `SELECT * FROM alerts ORDER BY created DESC LIMIT 1`,
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows[0]);
          }
        }
      );
    }); 
  });
}
function getAll() {
  let db = new sqlite3.Database(dbName);
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // delete old after 6 month
      //db.run(`DELETE FROM alerts WHERE created < DATETIME('now', '-6 month')`);
      db.all(`SELECT * FROM alerts ORDER BY created DESC LIMIT 1000`, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
    db.close();
  });
}
function last5() {
  return new Promise((resolve, reject) => {
    db_reader.serialize(() => {
      db_reader.all(
        `SELECT * FROM alerts ORDER BY created DESC LIMIT 5`,
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    }); 
  });
}
module.exports = {
  createDB,
  insert,
  getLast,
  getAll,
  last5,
};
