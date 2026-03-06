const GenNet = require("../db-models/gen-net");
const { CronJob } = require("cron");

const deleteUnusedGenNets = async () => {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 180);
    const result = await GenNet.deleteMany({ lastFetchedAt: { $lt: threshold } });
    console.log(`Deleted ${result.deletedCount} unused gen nets`);
};

const deleteUnusedGenNetsCronJob = CronJob.from({
    cronTime: '0 0 * * *', // every day
    onTick: async () => {
        try {
            await deleteUnusedGenNets();
        } catch (error) {
            console.error("Error deleting unused gen nets:", error);
        }
    },
    start: false,
});


module.exports = deleteUnusedGenNetsCronJob;