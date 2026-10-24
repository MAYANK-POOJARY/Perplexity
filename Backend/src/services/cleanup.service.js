import attachmentModel from "../models/attachment.model.js";
import { removeAttachmentFiles } from "../controllers/attachment.controllers.js";

const MAX_AGE_MS = 2 * 60 * 60 * 1000;   // an upload that was never sent is deleted after 2 hours
const EVERY_MS = 30 * 60 * 1000;         // the cleanup runs every 30 minutes
const BATCH_SIZE = 50;                   // at most this many per run, so one run never takes long

export async function cleanupUnsentAttachments() {
    const cutoff = new Date(Date.now() - MAX_AGE_MS);

    const stale = await attachmentModel
        .find({ message: null, createdAt: { $lt: cutoff } })
        .select("_id")
        .limit(BATCH_SIZE);

    let removed = 0;
    for (const { _id } of stale) {
        // atomic, like the delete button: if the file got sent in the meantime, this finds nothing and skips it
        const attachment = await attachmentModel.findOneAndDelete({ _id, message: null });
        if (!attachment) continue;

        await removeAttachmentFiles([attachment]);
        removed++;
    }

    if (removed) console.log(`Cleanup: removed ${removed} unsent upload(s)`);
}

export function startCleanupJob() {
    const run = () => cleanupUnsentAttachments().catch((error) => console.error("Cleanup failed:", error));

    run();                                  // once at startup (catches what a crash or a closed tab left behind)
    setInterval(run, EVERY_MS).unref();     // then regularly. unref() = this timer alone never keeps the server alive
}