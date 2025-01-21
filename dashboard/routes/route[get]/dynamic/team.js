const index = (fastify, options, done) => {
    fastify.get("/team", async(req, res) => {
        return req.render("/dynamic/team.liquid")
    });
    done();
};

module.exports = index;