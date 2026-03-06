const mongoose = require("mongoose");
const { Schema } = mongoose;

const PlaceSchema = new Schema({
	id: { type: String, required: true },
	name: { type: String, required: true },
	charFunc: { type: String, default: null },
	mergeFunction: { type: String, default: null },
	priority: { type: Number, required: true },
	capacity: { type: Number, required: true },
});

const TransitionItemSchema = new Schema({
	source: { type: String, required: true },
	target: { type: String, required: true },
	predicate: { type: String, default: null },
	capacity: { type: Number, required: true },
});

const TransitionSchema = new Schema({
	id: { type: String, required: true },
	name: { type: String, required: true },
	splitFunction: { type: String, default: null },
	data: { type: [TransitionItemSchema], required: true },
	priority: { type: Number, required: true },
});
const TokenSchema = new Schema({
	id: { type: String, required: true },
	name: { type: String, required: true },
	host: { type: String, required: true },
	priority: { type: Number, required: true },
	initialChars: { type: Map, of: Schema.Types.Mixed, required: true },
});
const GenNetRawSchema = new Schema({
	places: { type: [PlaceSchema], required: true },
	transitions: { type: [TransitionSchema], required: true },
	tokens: { type: [TokenSchema], required: true },
});

module.exports = GenNetRawSchema;