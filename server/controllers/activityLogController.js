import ActivityLog from '../models/ActivityLog.js';
import { pruneActivityLogs } from '../utils/activityLogger.js';

/**
 * Create an activity log entry with strict 20 record retention.
 */
export const createLog = async ({
  action,
  actor = {},
  targetType = '',
  targetId = null,
  targetName = '',
  details = '',
  meta = {}
}) => {
  try {
    const log = new ActivityLog({
      action,
      user: {
        id: actor._id || null,
        name: actor.name || '',
        email: actor.email || '',
        role: actor.role || 'user'
      },
      details,
      meta: { ...meta, targetType, targetId, targetName }
    });
    await log.save();
    await pruneActivityLogs(20);
  } catch (error) {
    console.error('Error creating activity log:', error);
  }
};

/**
 * Retrieve logs strictly capped to latest 20 records.
 */
export const getLogs = async (req, res, next) => {
  try {
    await pruneActivityLogs(20);
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 20);
    const total = await ActivityLog.countDocuments();
    const logs = await ActivityLog.find()
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      total: Math.min(total, 20),
      count: logs.length,
      page: 1,
      pages: 1,
      logs
    });
  } catch (error) {
    next(error);
  }
};
