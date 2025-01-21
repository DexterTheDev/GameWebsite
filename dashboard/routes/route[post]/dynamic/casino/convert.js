const db = require("playerio-node");

const index = (fastify, options, done) => {
  fastify.post("/casino/convert", async (req, res) => {
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
                let item = req.body.item;
                let itemsLength = 0;
                client.payVault.refresh(async () => {
                  itemsLength = client.payVault.items.length;
                  if (!client.payVault.has(item))
                    return res.send({
                      error: true,
                      message: "You don't have this item",
                    });
                  else {
                    let price = 0;
                    let wikiItem =
                      require("../../../../../items").itemsArray.filter(
                        (i) => i.id.toLowerCase() == item.toLowerCase()
                      )[0];
                    switch (wikiItem.type) {
                      case "rare":
                        price = 30;
                        break;
                      case "premium":
                        price = 50;
                        break;
                      case "legacy":
                        price = 300;
                        break;
                      case "deluxe":
                        price = 850;
                        break;
                      case "unique":
                        price = 5500;
                        break;
                    }

                    client.payVault.consume(
                      [client.payVault.first(item)],
                      function () {
                        u.bluetokens += price;
                        u.save();
                        client.bigDB.loadOrCreate(
                          "CasinoLogs",
                          require("../../../../../index").RandomString(12),
                          async (log) => {
                            log.user =
                              client.connectUserId?.split("simple")[1] ??
                              client.connectUserId;
                            log.amount = `+${price}`;
                            log.item = wikiItem.id;
                            log.date = require("moment")(Date.now()).format(
                              "lll"
                            );
                            log.createdAt = Date.now();
                            log.type = `Converted ${wikiItem.name} into BC`;
                            log.mainType = "convert";
                            log.save();
                          }
                        );
                        res.send({
                          error: false,
                          itemsLength:
                            itemsLength - 1 <= 0 ? 0 : itemsLength - 1,
                          bluecoins: u.bluetokens,
                          message: `Converted 1 ${wikiItem.name} into ${price} bc`,
                        });
                      },
                      function (error) {
                        res.send({
                          error: true,
                          message: `Error occured while converting, refresh the page!`,
                        });
                      }
                    );
                  }
                });
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
