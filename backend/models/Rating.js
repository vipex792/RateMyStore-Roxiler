const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Rating = sequelize.define(
    'Rating',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      store_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'stores',
          key: 'id',
        },
      },
      rating: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
          isInt: true,
        },
      },
    },
    {
      timestamps: true,
      tableName: 'ratings',
      indexes: [
        {
          unique: true,
          fields: ['user_id', 'store_id'],
        },
      ],
    }
  );

  return Rating;
};
