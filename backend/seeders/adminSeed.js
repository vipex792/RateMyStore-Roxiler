const db = require('../models');

const seedAdmin = async () => {
  try {
    const adminExists = await db.User.findOne({
      where: { role: 'admin' },
    });

    if (!adminExists) {
      await db.User.create({
        name: 'System Administrator User',
        email: 'admin@admin.com',
        password: 'Admin@1234',
        address: 'Default Admin Address Here',
        role: 'admin',
      });
      console.log('Default admin user created successfully.');
    } else {
      console.log('Admin user already exists. Skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error.message);
  }
};

module.exports = seedAdmin;
