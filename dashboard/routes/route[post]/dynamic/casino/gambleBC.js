const db = require("playerio-node");

const index = (fastify, options, done) => {
  fastify.post("/casino/gambleBC", async (req, res) => {
    db.PlayerIO.authenticate(
      "surf--gle056q8huavuerrdccbyg",
      "public",
      {
        username: req.session.get("username"),
        password: req.session.get("password"),
      },
      {},
      (c) => {
        db.PlayerIO.authenticate(
          "surf--gle056q8huavuerrdccbyg",
          "shopconnection",
          {
            userId: c.connectUserId,
            auth: require("../../../../../index").hashGenerator(
              c.connectUserId
            ),
          },
          {},
          (client) => {
            client.bigDB.loadOrCreate(
              "Division",
              client.connectUserId?.split("simple")[1] ?? client.connectUserId,
              async (u) => {
                let betValue = Number(req.body.bc);
                if (!betValue || isNaN(betValue))
                  res.send({
                    error: true,
                    message: "Only Numbers are allowed",
                  });
                else if (betValue < 20 || betValue > 1000)
                  res.send({
                    error: true,
                    message: "Min 20 and Max 1000 Betting Amount",
                  });
                else if (betValue > u.bluetokens)
                  res.send({
                    error: true,
                    message: "You don't have enough bluecoins",
                  });
                else {
                  let lose = true;
                  if (Math.random() < 0.6) {
                    u.bluetokens -= betValue;
                    u.save();
                    res.send({
                      error: false,
                      bluecoins: u.bluetokens,
                      bcValue: `-${betValue}BC`,
                      betMsg: "You've lost the bet",
                      lose: true,
                    });
                  } else {
                    lose = false;
                    u.bluetokens += betValue;
                    u.save();
                    res.send({
                      error: false,
                      bluecoins: u.bluetokens,
                      bcValue: `+${betValue}BC`,
                      betMsg: "You've won the bet!",
                      lose: false,
                    });
                  }

                  client.bigDB.loadOrCreate(
                    "CasinoLogs",
                    require("../../../../../index").RandomString(12),
                    async (log) => {
                      log.user =
                        client.connectUserId?.split("simple")[1] ??
                        client.connectUserId;
                      log.status = lose ? "Lost" : "Won";
                      log.amount = lose ? `-${betValue}` : `+${betValue}`;
                      log.date = require("moment")(Date.now()).format("lll");
                      log.createdAt = Date.now();
                      log.mainType = "bc";
                      log.type = "Gambling BC";
                      log.save();
                    }
                  );
                }
              }
            );
          }
        );
      },
      (error) => res.send({ error: true, message: "You're not logged in!" })
    );

    return res;
  });
  done();
};

module.exports = index;
