const db = require("playerio-node");

const index = (fastify, options, done) => {
  fastify.post("/casino/login", async (req, res) => {
    if (!req.body.username || !req.body.password)
      res.send({ error: true, message: "Make sure to fill all the fields" });
    else {
      if (req.body.login) {
        db.PlayerIO.authenticate(
          "surf--gle056q8huavuerrdccbyg",
          "public",
          {
            username: req.body.username,
            password: req.body.password,
          },
          {},
          () => {
            req.session.set("username", req.body.username);
            req.session.set("password", req.body.password);
            res.send({
              error: false,
              message: "Logged In Successfully",
            });
          },
          (error) =>
            res.send({
              error: true,
              message: error.message.split("Simple Authentication: ")[1],
            })
        );
      } else {
        req.session.delete();
        res.send({
          error: false,
          message: "Logged Out Successfully",
        });
      }

      return res;
    }
  });

  done();
};

module.exports = index;
