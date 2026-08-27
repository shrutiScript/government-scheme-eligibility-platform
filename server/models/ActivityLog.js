import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: [true, 'Activity action is required'],
      trim: true
    },
    // Who performed the action (safe public fields only — never passwords or tokens)
    user: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
      },
      name: {
        type: String,
        default: '',
        trim: true
      },
      email: {
        type: String,
        default: '',
        trim: true
      },
      role: {
        type: String,
        default: 'user',
        trim: true
      }
    },
    details: {
      type: String,
      default: '',
      trim: true
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ action: 1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
