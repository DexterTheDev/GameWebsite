const index = (fastify, options, done) => {
    fastify.get("/mobile", async(req, res) => {
        return req.render("/dynamic/mobile.liquid")
    });
    done();
};

module.exports = index;