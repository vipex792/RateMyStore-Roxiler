const sequelize = require('../config/database');
const UserModel = require('./User');
const StoreModel = require('./Store');
const RatingModel = require('./Rating');

const db = {};

db.sequelize = sequelize;

// Initialize models
db.User = UserModel(sequelize);
db.Store = StoreModel(sequelize);
db.Rating = RatingModel(sequelize);

// Associations

// Store belongs to User (owner)
db.Store.belongsTo(db.User, {
  foreignKey: 'owner_id',
  as: 'owner',
});
db.User.hasOne(db.Store, {
  foreignKey: 'owner_id',
  as: 'store',
});

// Rating belongs to User
db.Rating.belongsTo(db.User, {
  foreignKey: 'user_id',
  as: 'user',
});
db.User.hasMany(db.Rating, {
  foreignKey: 'user_id',
  as: 'ratings',
});

// Rating belongs to Store
db.Rating.belongsTo(db.Store, {
  foreignKey: 'store_id',
  as: 'store',
});
db.Store.hasMany(db.Rating, {
  foreignKey: 'store_id',
  as: 'ratings',
});

module.exports = db;
