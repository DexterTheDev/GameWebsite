const db = require("playerio-node");

const index = (fastify, options, done) => {
  fastify.post("/casino/gambleItem", async (req, res) => {
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
                let betValue = 0;
                let item = "rarescratch";
                let betrate = 1;
                switch (req.body.item.toLowerCase()) {
                  case "deluxe":
                    betValue = 1500;
                    item = "deluxescratch";
                    betrate = 0.93;
                    break;
                  case "legacy":
                    betValue = 400;
                    item = "legacyscratch";
                    betrate = 0.75;
                    break;
                  case "premium":
                    betValue = 75;
                    item = "premiumscratch";
                    betrate = 0.6;
                    break;
                  case "rare":
                    betValue = 50;
                    item = "rarescratch";
                    betrate = 0.5;
                    break;
                  default:
                    betValue = 0;
                }
                if (betValue > u.bluetokens)
                  res.send({
                    error: true,
                    message: "You don't have enough bluecoins",
                  });
                else if (betValue === 0)
                  res.send({
                    error: true,
                    message: "Unknow item!",
                  });
                else {
                  let lose = true;
                  if (Math.random() < betrate) {
                    u.bluetokens -= betValue;
                    u.save();
                    res.send({
                      error: false,
                      bluecoins: u.bluetokens,
                      bcValue: `-${betValue}BC`,
                      betMsg: "You've lost the bet",
                      lose: true,
                      itemName: "gifthead",
                      item: true,
                    });
                  } else {
                    let itemsLength = 0;
                    lose = false;
                    client.payVault.refresh(
                      function () {
                        itemsLength = client.payVault.items.length;
                        client.payVault.give(
                          [{ itemkey: item }],
                          () => {
                            u.bluetokens -= betValue;
                            u.save();
                            res.send({
                              error: false,
                              bluecoins: u.bluetokens,
                              bcValue: `-${betValue}BC`,
                              betMsg: `You've won ${
                                require("../../../../../items").itemsArray.filter(
                                  (i) =>
                                    i.id.toLowerCase() == item.toLowerCase()
                                )[0].name
                              }`,
                              lose: false,
                              itemName: item,
                              itemsLength:
                                itemsLength + 1 <= 0 ? 0 : itemsLength + 1,
                              item: true,
                            });
                          },
                          function (error) {
                            res.send({
                              error: true,
                              message: "Refresh the page please",
                            });
                          }
                        );
                      },
                      function (error) {
                        req.session.delete();
                        res.send({
                          error: true,
                          message: "Error Occured Reloggin Please!",
                        });
                      }
                    );
                  }
                  client.bigDB.loadOrCreate(
                    "CasinoLogs",
                    require("../../../../../index").RandomString(12),
                    async (log) => {
                      log.user =
                        client.connectUserId?.split("simple")[1] ??
                        client.connectUserId;
                      log.status = lose ? "Lost" : "Won";
                      log.amount = `-${betValue}`;
                      log.date = require("moment")(Date.now()).format("lll");
                      log.createdAt = Date.now()
                      log.mainType="item"
                      log.type = `Gambling for ${
                        require("../../../../../items").itemsArray.filter(
                          (i) => i.id.toLowerCase() == item.toLowerCase()
                        )[0].name
                      }`;
                      log.item = item;
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
