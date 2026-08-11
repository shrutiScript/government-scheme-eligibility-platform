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
    eligibilityCriteria: {
      minAge: { type: Number, default: 0 },
      maxAge: { type: Number, default: 120 },
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

// Search Index
schemeSchema.index({ title: 'text', description: 'text', department: 'text', category: 'text', tags: 'text' });

const Scheme = mongoose.model('Scheme', schemeSchema);
export default Scheme;
