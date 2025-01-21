const index = (fastify, options, done) => {
    fastify.get("/play", async(req, res) => {
        return req.render("/dynamic/play.liquid")
    });
    done();
};

module.exports = index;