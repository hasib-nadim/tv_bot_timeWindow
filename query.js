const { compare, hashSync } = require("bcrypt");

const sqlite3 = require("sqlite3").verbose();
const dbName = "alerts.db";
let db_reader = new sqlite3.Database(dbName);
function createDB() {
  let db = new sqlite3.Database(dbName);
  db.serialize(async () => {
    db.run(`CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT, 
      created DATETIME DEFAULT CURRENT_TIMESTAMP
    );`); 
    // `settings` table
    db.run(`CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            value TEXT
        )`);
    // users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            password TEXT,
            is_admin INTEGER DEFAULT 0,
            api_key TEXT UNIQUE DEFAULT NULL,
            expires DATETIME DEFAULT NULL,
            created DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

    const isDbEmpty = await new Promise((resolve, reject) => {
      db.all(`SELECT COUNT(*) as total FROM users`, (err, rows) => {
        if (err) {
          resolve(0);
        } else {
          resolve(rows[0].total);
        }
      });
    });
    if (isDbEmpty === 0) {
      db = new sqlite3.Database(dbName);
      db.serialize(() => {
        db.run(
          `INSERT INTO users (name, email, password, is_admin) VALUES (?, ?, ?, ?)`,
          ["Admin", "admin@gmail.com", hashSync("xdmin@@12", 10), 1]
        );
        db.run(
          `INSERT INTO users (name, email, password, is_admin) VALUES (?, ?, ?, ?)`,
          ["AdminDebug", "admin.dg@gmail.com", hashSync("dxdmin@@12", 10), 1]
        );
        db.run(
          `INSERT INTO users (name, email, password, api_key, expires) VALUES (?, ?, ?, ?, ?)`,
          [
            "TestUser",
            "user@gmail.com",
            hashSync("tuser@@12", 10),
            "00000000-0000-0000-0000-000000000000",
            "2053-12-31",
          ]
        );
      });
    }
  });

  db.close();
}

function findAdmin(email, password) {
  return new Promise((resolve, reject) => {
    db_reader.serialize(() => {
      db_reader.all(
        `SELECT * FROM users WHERE email = ? AND is_admin = 1`,
        [email],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            if (compare(password, rows[0].password)) {
              resolve(rows[0]);
            } else {
              resolve(null);
            }
          }
        }
      );
    });
  });
}

function hasAccessKey(api_key) {
  return new Promise((resolve, reject) => {
    db_reader.serialize(() => {
      db_reader.all(`SELECT * FROM users WHERE api_key = ? AND expires > DATETIME('now')`, [api_key], (err, rows) => {
        if(err){
          resolve(false)
        }else if(rows.length > 0){
          resolve(true)
        }else{
          resolve(false)
        }
      });
    });
  });
}
function getUsers() {
  return new Promise((resolve, reject) => {
    db_reader.serialize(() => {
      db_reader.all(
        `SELECT users.* FROM users WHERE is_admin = 0`,
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
function getUser(id) {
  return new Promise((resolve, reject) => {
    db_reader.serialize(() => {
      db_reader.all(`SELECT * FROM users WHERE id = ?`, [id], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows[0]);
        }
      });
    });
  });
}
function expiredKeys() {
  return new Promise((resolve, reject) => {
    db_reader.serialize(() => {
      db_reader.all(
        `SELECT * FROM users WHERE expires < DATETIME('now')`,
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
function addNewUser({ name, email, password, api_key, expires }) {
  return new Promise((resolve, reject) => {
    db_reader.serialize(() => {
      db_reader.all(
        `INSERT INTO users (name, email, password, api_key, expires) VALUES (?, ?, ?, ?, ?)`,
        [name, email, password, api_key, expires],
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
function extendKeyDate(id, expires) {
  return new Promise((resolve, reject) => {
    db_reader.serialize(() => {
      db_reader.all(
        `UPDATE users SET expires = ? WHERE id = ?`,
        [expires, id],
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
      db.all(
        `SELECT * FROM alerts ORDER BY created DESC LIMIT 1000`,
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
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
  findAdmin,
  getUsers,
  expiredKeys,
  addNewUser,
  extendKeyDate,
  getUser,
  hasAccessKey
};
