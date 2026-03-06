const mongoose = require("mongoose");
const GenNetSettingsSchema = require("./settings");
const GenNetRawSchema = require("./gen-net-raw");
const { default: isSvg } = require("is-svg");

const GenNetSchema = new mongoose.Schema({
	// TODO: validate
	content: {
		genNetRaw: {
			type: GenNetRawSchema,
			required: true,
		},
		settings: {
			type: GenNetSettingsSchema,
			required: true,
		},
		code: {
			type: String,
			required: true,
		},
		svg: {
            type: String,
            validate: {
                validator: function (svg) {
                    return !svg || isSvg(svg);
                },
                message: "Invalid svg!",
            }
        },
	},
	lastFetchedAt: Date,
});

// cool idea
GenNetSchema.pre("save", function (next) {
	this.lastFetchedAt = new Date();
	next();
});

module.exports = mongoose.model("GenNet", GenNetSchema);
