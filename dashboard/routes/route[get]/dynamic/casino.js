const db = require("playerio-node");

const index = (fastify, options, done) => {
  fastify.get("/casino", async (req, res) => {
    let logged = false;
    let user = {
      username: "Unlogged in",
      bts: 0,
      items: [],
    };
    function connection() {
      return new Promise(async function (resolve, reject) {
        db.PlayerIO.authenticate(
          "surf--gle056q8huavuerrdccbyg",
          "public",
          {
            username: req.session.get("username"),
            password: req.session.get("password"),
          },
          {},
          (c) => {
            user.username = req.session.get("username");
            logged = true;
            db.PlayerIO.authenticate(
              "surf--gle056q8huavuerrdccbyg",
              "shopconnection",
              {
                userId: c.connectUserId,
                auth: require("../../../../index").hashGenerator(
                  c.connectUserId
                ),
              },
              {},
              (client) => {
                client.bigDB.loadOrCreate(
                  "Division",
                   client.connectUserId?.split("simple")[1] ?? client.connectUserId,
                  async (u) => {
                    user.bts = u.bluetokens;
                    client.payVault.refresh(() => {
                      user.itemsLength = client.payVault.items.length;
                      client.payVault.items.map((item) => {
                        let wikiItem =
                          require("../../../../items").itemsArray.filter(
                            (i) =>
                              i.id.toLowerCase() == item.itemKey.toLowerCase()
                          )[0];
                        if (!wikiItem) return;
                        if (wikiItem.type == "normal") return;
                        if (
                          [
                            "silvercoin",
                            "teamskin",
                            "vippassit",
                            "bronzecoin",
                            "goldcoin",
                            "platcoin",
                            "vipskinit",
                            "dj",
                            "lawskin",
                            "classifiedskin",
                            "sstbg",
                            "lawbg",
                            "premiumscratch",
                            "legacyscratch","rarescratch","deluxescratch"
                          ].includes(wikiItem.id)
                        )
                          return;
                        let sortOrder = [
                          "unique",
                          "deluxe",
                          "legacy",
                          "premium",
                          "rare",
                        ];
                        user.items.push(wikiItem);
                        user.items.sort((a, b) => {
                          return (
                            sortOrder.indexOf(a.type) -
                            sortOrder.indexOf(b.type)
                          );
                        });
                      });
                      resolve();
                    });
                  }
                );
              }
            );
          },
          (error) => resolve()
        );
      });
    }
    await connection().then(() => {
      return req.render("/dynamic/casino.liquid", { logged, user });
    });
  });
  done();
};

module.exports = index;
