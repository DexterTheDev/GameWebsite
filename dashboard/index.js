const { port } = require("../config");
const fastify = require('fastify')({ logger: false });
const { Liquid } = require("liquidjs");
const path = require("path");


fastify.register(require('@fastify/formbody',))

fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, 'public'),
    prefix: '/public/'
});

const engine = new Liquid({
    root: path.join(__dirname, "components"),
    extname: ".liquid",
});

fastify.register(require("@fastify/view"), {
    engine: {
        liquid: engine,
    },
});

fastify.register(require('@fastify/secure-session'), {
    cookieName: 'connect.sid',
    secret: "#@%#&^$^$%@$^$&%#$%@#$%$^%&$%^#$%@#$%#E%#%@$FEErfgr3g#%GT%536c53cc6%5%tv%4y4hrgrggrgrgf4n",
    cookie: {
        path: '/',
        maxAge: 86400000000
    },
    saveUninitialized: false
});

fastify.addHook('preHandler', (req, res, done) => {
    req.config = require("../config.js")
    req.render = async (file, data = {}, status) => {
        const baseData = {
            config: require("../config.js")
        };
        await res.view(`/dashboard/components/${file}`, Object.assign(baseData, data))
    }
    done()
});


fastify.decorate('notFound', (request, reply) => {
    return request.render("./handlers/error.liquid", { status: 404 }, 404);
});
fastify.setNotFoundHandler(fastify.notFound);

require("./routes.json").map(async route => {
    await fastify.register(require(route));
})

fastify.listen({ port }, () => console.log("site is up"));

