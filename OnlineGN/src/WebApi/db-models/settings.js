const mongoose = require("mongoose");
const { Schema } = mongoose;

const SimulationSettingsSchema = new Schema({
	stepDurationMS: { type: Number, required: true },
});

const GenNetSettingsSchema = new Schema({
	simulationSettings: { type: SimulationSettingsSchema, required: true },
});

module.exports = GenNetSettingsSchema;
