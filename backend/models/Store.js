const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Store = sequelize.define(
    'Store',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(60),
        allowNull: false,
        validate: {
          len: [20, 60],
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: [0, 400],
        },
      },
      owner_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
    },
    {
      timestamps: true,
      tableName: 'stores',
    }
  );

  return Store;
};
