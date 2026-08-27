import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please enter a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long']
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active'
    },
    // Demographic Profile Fields
    age: {
      type: Number,
      min: [1, 'Age must be 1 or greater (cannot be 0 or negative)'],
      max: [120, 'Age cannot exceed 120 years']
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Transgender', 'Other', '']
    },
    state: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    mobileNumber: {
      type: String,
      trim: true
    },
    occupation: {
      type: String,
      trim: true
    },
    education: {
      type: String,
      trim: true
    },
    annualIncome: {
      type: Number,
      min: [0, 'Annual income cannot be negative']
    },
    caste: {
      type: String,
      trim: true
    },
    disabilityStatus: {
      type: Boolean,
      default: false
    },
    bplStatus: {
      type: Boolean,
      default: false
    },
    avatar: {
      type: String,
      default: ''
    },
    savedSchemes: [
      {
        scheme: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Scheme',
          required: true
        },
        savedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Sync and Hash password before saving
userSchema.pre('save', async function (next) {
  // Sync status and isBlocked reliably based on which field was modified
  if (this.isModified('isBlocked')) {
    this.status = this.isBlocked ? 'blocked' : 'active';
  } else if (this.isModified('status')) {
    this.isBlocked = this.status === 'blocked';
  } else {
    if (this.isBlocked || this.status === 'blocked') {
      this.isBlocked = true;
      this.status = 'blocked';
    } else {
      this.isBlocked = false;
      this.status = 'active';
    }
  }

  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Transform to remove password from returned JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  // Ensure status field is always returned and accurate based on isBlocked
  if (obj.isBlocked) {
    obj.status = 'blocked';
  } else {
    obj.status = 'active';
  }
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
