const db = require("playerio-node");

const index = (fastify, options, done) => {
  fastify.get("/casinolog", async (req, res) => {
    db.PlayerIO.authenticate(
      "surf--gle056q8huavuerrdccbyg",
      "shopconnection",
      {
        userId: "CasinoLogs",
        auth: require("../../../../index").hashGenerator("CasinoLogs"),
      },
      {},
      (client) => {
        client.bigDB.loadRange(
          "CasinoLogs",
          "createdAt", null, null, null,
          100,
          function (obj) {
            let logs = [];
            for (let i = 0; i < 10; i++) logs.push(obj[i]);
            res.send({ logs });
          },
          function (error) {
            res.send({ logs: [], error: true });
          }
        );
      }
    );
    return res;
  });
  done();
};

module.exports = index;
