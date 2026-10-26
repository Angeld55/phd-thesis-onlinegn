const mongoose = require("mongoose");
const configObj = require("./config");

const connectDB = async () => {
    const config = configObj.getConfig();

    if (!config.databaseUrl) {
        throw new Error("DATABASE_URL is not configured");
    }

    const options = {
        serverSelectionTimeoutMS: 10000
    };

    if (configObj.env === "production" &&
        config.dbUser && config.dbPassword) {
        options.user = config.dbUser;
        options.pass = config.dbPassword;
    }

    await mongoose.connect(config.databaseUrl, options);

    console.log("MongoDB connected successfully");
};

module.exports = connectDB;

