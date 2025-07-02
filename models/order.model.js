module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
      defaultValue: 'pending'
    }
  }, {
    tableName: 'orders',
    timestamps: true
  });

  Order.associate = models => {
    Order.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    
    Order.hasMany(models.OrderItem, {
      foreignKey: 'orderId',
      as: 'items'
    });
  };

  return Order;
};