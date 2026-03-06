const { db } = require("../db-models/gen-net");

// TODO: this is real world example will come as env variables
module.exports = {
    env: process.env.NODE_ENV || "development",
	development: {
		privateKey: "DEV-TEST",
		databaseUrl: "mongodb://0.0.0.0:27017/test",
	},
	production: {
		privateKey: process.env.PRIVATE_KEY,
		databaseUrl: process.env.DATABASE_URL,
		dbUser: process.env.DB_USER,
		dbPassword: process.env.DB_PASSWORD,
    },
    getConfig: function () {
        return this[this.env];
    }
};