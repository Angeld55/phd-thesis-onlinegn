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
connectDB();

// Configure
app.use(
	cors({
		exposedHeaders: "Authorization",
	})
);
app.use(express.json());
app.use(express.static(path.resolve("static")));
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/genNets", genNetsRouter);

app.use((req, res, next) => {
	// return front end
	res.sendFile(path.resolve("static/index.html"));
})

// Start server
server.listen(PORT, () => {
	console.log(
		`Server is running on port ${PORT}. Visit http://localhost:${PORT}`
	);
});

// Start cron job
const deleteUnusedGenNetsCronJob = require("./cron-jobs/delete-unused-gen-nets");
deleteUnusedGenNetsCronJob.start();