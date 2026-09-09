import ActivityLog from '../models/ActivityLog.js';

const MAX_ACTIVITY_LOGS = 20;

/**
 * Enforces strict 20-record retention for Activity Logs in MongoDB.
 * Keeps the newest 20 logs based on createdAt and permanently deletes the oldest records.
 */
export const pruneActivityLogs = async (maxKeep = MAX_ACTIVITY_LOGS) => {
  try {
    const total = await ActivityLog.countDocuments();
    if (total > maxKeep) {
      // Find IDs of the newest `maxKeep` logs sorted by latest createdAt
      const keepLogs = await ActivityLog.find()
        .sort({ createdAt: -1, _id: -1 })
        .limit(maxKeep)
        .select('_id')
        .lean();

      const keepIds = keepLogs.map((l) => l._id);

      // Permanently remove all older records from MongoDB
      await ActivityLog.deleteMany({ _id: { $nin: keepIds } });
    }
  } catch (error) {
    console.error('[Activity Log] Failed to prune excess logs:', error.message);
  }
};

/**
 * Creates an activity log entry and immediately prunes excess records
 * so total documents in MongoDB never exceed 20.
 */
export const logActivity = async ({ action, user, details = '', meta = {} }) => {
  try {
    await ActivityLog.create({
      action,
      user: user && user._id
        ? {
            id: user._id,
            name: user.name || '',
            email: user.email || '',
            role: user.role || 'user'
          }
        : {},
      details,
      meta
    });

    // Strict 20 retention enforcement immediately on every new log
    await pruneActivityLogs(MAX_ACTIVITY_LOGS);
  } catch (error) {
    console.error('[Activity Log] Failed to record activity:', error.message);
  }
};
