import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { connectDB } from '../config/db.js';

dotenv.config();

export const seedAdminUser = async () => {
  try {
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin@123';

    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      admin.password = adminPassword;
      admin.role = 'admin';
      if (!admin.name) admin.name = 'System Admin';
      await admin.save();
      console.log(`[Seed Admin] Admin account '${adminEmail}' updated successfully.`);
    } else {
      admin = await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });
      console.log(`[Seed Admin] Admin account '${adminEmail}' created successfully.`);
    }
    return admin;
  } catch (error) {
    console.error('[Seed Admin Error] Failed to seed admin user:', error.message);
    throw error;
  }
};

// Standalone execution support
if (process.argv[1] && (process.argv[1].includes('seedAdmin.js') || process.argv[1].includes('seedAdmin'))) {
  (async () => {
    try {
      await connectDB();
      await seedAdminUser();
      console.log('[Seed Admin] Execution finished.');
      process.exit(0);
    } catch (err) {
      console.error('[Seed Admin] Error:', err);
      process.exit(1);
    }
  })();
}
