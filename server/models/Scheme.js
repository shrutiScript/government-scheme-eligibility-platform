import mongoose from 'mongoose';

const schemeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Scheme title is required'],
      trim: true
    },
    shortDescription: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      required: [true, 'Scheme description is required'],
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Department or Ministry name is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Scheme category is required'],
      trim: true
    },
    state: {
      type: String,
      default: 'All India',
      trim: true
    },
    beneficiaries: {
      type: String,
      default: 'All Citizens',
      trim: true
    },
    benefitAmount: {
      type: String,
      default: '',
      trim: true
    },
    benefits: {
      type: mongoose.Schema.Types.Mixed, // Can be array of strings or formatted string
      default: ''
    },
    code: {
      type: String,
      default: '',
      trim: true
    },
    sponsorType: {
      type: String,
      default: 'Central Scheme',
      trim: true
    },
    detailedDescription: {
      type: String,
      default: '',
      trim: true
    },
    targetStates: {
      type: [String],
      default: ['All']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    eligibilityCriteria: {
      noAgeLimit: { type: Boolean, default: false },
      minAge: { type: Number, default: null },
      maxAge: { type: Number, default: null },
      gender: { type: String, default: 'All' },
      maxIncome: { type: Number, default: 10000000 },
      minIncome: { type: Number, default: 0 },
      allowedStates: { type: [String], default: ['All'] },
      allowedOccupations: { type: [String], default: ['All'] },
      allowedEducations: { type: [String], default: ['All'] },
      allowedCastes: { type: [String], default: ['All'] },
      disabilityRequired: { type: Boolean, default: false },
      bplRequired: { type: Boolean, default: false }
    },
    // Alternate eligibility shape used by the admin form. Persisted consistently
    // with eligibilityCriteria so both read paths always see the same rules.
    eligibility: {
      type: mongoose.Schema.Types.Mixed,
      default: undefined
    },
    requiredDocuments: {
      type: [String],
      default: []
    },
    documentsRequired: {
      type: [String],
      default: []
    },
    applicationProcess: {
      type: String,
      default: 'Applications can be submitted online via the official portal or offline through nearest Common Service Centres (CSC) / Nodal District Offices.'
    },
    officialWebsiteUrl: {
      type: String,
      default: '',
      trim: true
    },
    helpline: {
      type: String,
      default: '1800-115-565 / Support Email: helpdesk-scheme@gov.in'
    },
    launchDate: {
      type: String,
      default: '2019-02-24'
    },
    tags: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    },
    viewCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Ensure status and isActive are always in sync
schemeSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.isActive = this.status === 'Active';
  } else if (this.isModified('isActive')) {
    this.status = this.isActive ? 'Active' : 'Inactive';
  }
  if (!this.description && this.detailedDescription) {
    this.description = this.detailedDescription;
  }
  if (!this.shortDescription && this.description) {
    this.shortDescription = this.description.slice(0, 200);
  }
  next();
});

// Search Index
schemeSchema.index({ title: 'text', description: 'text', department: 'text', category: 'text', tags: 'text' });

const Scheme = mongoose.model('Scheme', schemeSchema);
export default Scheme;
