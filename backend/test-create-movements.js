/**
 * Test Stock Movements Creation
 * Creates sample stock movements for testing
 */

const mongoose = require('mongoose');
require('dotenv').config();
const StockMovement = require('./models/StockMovement');
const Product = require('./models/Product');

async function createSampleMovements() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/stock-management');
    console.log('✅ Connected to MongoDB');

    // Get some existing products
    const products = await Product.find().limit(3);
    console.log(`📦 Found ${products.length} products`);

    if (products.length === 0) {
      console.log('❌ No products found. Please add some products first.');
      return;
    }

    // Clear existing movements for clean test
    await StockMovement.deleteMany({});
    console.log('🧹 Cleared existing movements');

    // Create sample movements
    const sampleMovements = [
      {
        product: products[0]._id,
        type: 'entry',
        quantity: 25,
        unitPrice: products[0].price,
        reason: 'purchase',
        description: 'Réapprovisionnement initial',
        reference: 'PO-2024-001',
        createdBy: 'admin'
      },
      {
        product: products[0]._id,
        type: 'exit',
        quantity: -5,
        unitPrice: products[0].price,
        reason: 'sale',
        description: 'Vente client',
        reference: 'SO-2024-001',
        createdBy: 'cashier'
      },
      {
        product: products[1]._id,
        type: 'entry',
        quantity: 50,
        unitPrice: products[1].price,
        reason: 'purchase',
        description: 'Commande fournisseur',
        reference: 'PO-2024-002',
        createdBy: 'admin'
      },
      {
        product: products[1]._id,
        type: 'adjustment',
        quantity: -2,
        unitPrice: 0,
        reason: 'correction',
        description: 'Correction inventaire - produits endommagés',
        createdBy: 'manager'
      }
    ];

    // Insert movements
    const createdMovements = await StockMovement.create(sampleMovements);
    console.log(`✅ Created ${createdMovements.length} sample movements`);

    // Display created movements
    for (const movement of createdMovements) {
      await movement.populate('product', 'name reference');
      console.log(`📋 ${movement.type.toUpperCase()}: ${movement.product.name} (${movement.quantity}) - ${movement.reason}`);
    }

    console.log('\n🎉 Sample stock movements created successfully!');

  } catch (error) {
    console.error('❌ Error creating sample movements:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

createSampleMovements();
