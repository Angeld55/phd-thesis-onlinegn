const express = require("express");
const http = require("http");
const path = require("path");
const bodyParser = require("body-parser");
const genNetsRouter = require("./routes/gen-net-routes");
const cors = require("cors");
const connectDB = require("./infrastructure/database");

const PORT = process.env.PORT || 3000;

// Configure
const app = express();
const server = http.createServer(app);

// Connect to database

const startServer = async () => {
    try {
        await connectDB();

        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        const deleteUnusedGenNetsCronJob =
            require("./cron-jobs/delete-unused-gen-nets");

        deleteUnusedGenNetsCronJob.start();
    } catch (error) {
        console.error("Failed to start OnlineGN:", error);
        process.exit(1);
    }
};

startServer();



// Configure
app.use(
	cors({
		exposedHeaders: "Authorization",
	})
);
app.use(express.json());
const staticDir = path.join(__dirname, "static");

app.use("/app", express.static(staticDir));
app.use(express.static(staticDir));
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/app/api/genNets", genNetsRouter);
app.use("/api/genNets", genNetsRouter);

app.use((req, res) => {
    if (req.method !== "GET") {
        return res.sendStatus(404);
    }

    if (
        req.path.startsWith("/api/") ||
        req.path.startsWith("/app/api/") ||
        /\.[^/]+$/.test(req.path)
    ) {
        return res.sendStatus(404);
    }

    res.sendFile(path.join(__dirname, "static", "index.html"));
});

// Start server
server.listen(PORT, () => {
	console.log(
		`Server is running on port ${PORT}. Visit http://localhost:${PORT}`
	);
});

// Start cron job
const deleteUnusedGenNetsCronJob = require("./cron-jobs/delete-unused-gen-nets");
deleteUnusedGenNetsCronJob.start();
