const cluster = require("cluster");
if (cluster.isPrimary) {
  cluster.fork();
  cluster.on("exit", (worker) => {
    // prettier-ignore
    console.log("\x1b[31m",`  worker ${worker.process.pid} died`,"\x1b[0m");
    cluster.fork();
  });
} else {
   require("./main");
}
