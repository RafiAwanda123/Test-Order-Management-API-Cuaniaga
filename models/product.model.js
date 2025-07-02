module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    }
  }, {
    tableName: 'products',
    timestamps: true
  });

  Product.associate = models => {
    Product.hasMany(models.OrderItem, {
      foreignKey: 'productId',
      as: 'orderItems'
    });
  };

  // Instance method untuk mengurangi stok
  Product.prototype.decrementStock = async function(quantity, transaction) {
    if (this.stock < quantity) {
      throw new Error('Insufficient stock');
    }
    
    this.stock -= quantity;
    return this.save({ transaction });
  };

  return Product;
};