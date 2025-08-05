// Test script for enhanced Product model static methods
const axios = require('axios');

const baseURL = 'http://localhost:5000/api';

async function testStaticMethods() {
  console.log('🧪 Testing Product Static Methods...\n');

  try {
    // First, let's create a few more test products for better testing
    console.log('📝 Creating additional test products...');
    
    const testProducts = [
      { name: 'High Stock Item', reference: 'HSI001', price: 25.00, quantity: 100, category: 'Electronics', minStock: 10 },
      { name: 'Out of Stock Item', reference: 'OSI001', price: 75.00, quantity: 0, category: 'Books', minStock: 5 },
      { name: 'Normal Stock Item', reference: 'NSI001', price: 15.00, quantity: 20, category: 'Electronics', minStock: 10 }
    ];

    for (const product of testProducts) {
      await axios.post(`${baseURL}/products`, product);
      console.log(`✅ Created: ${product.name}`);
    }

    console.log('\n📋 Testing Static Methods:');

    // Test 1: Get all products and see their virtual fields
    console.log('\n1️⃣ Getting all products to see stock statuses...');
    const allProducts = await axios.get(`${baseURL}/products`);
    
    if (allProducts.data.data) {
      console.log(`✅ Found ${allProducts.data.data.length} products:`);
      allProducts.data.data.forEach(product => {
        console.log(`   📦 ${product.name}:`);
        console.log(`      - Stock: ${product.quantity} (Status: ${product.stockStatus})`);
        console.log(`      - Total Value: $${product.totalValue}`);
        console.log(`      - Available: ${product.isAvailable}`);
      });
    }

    // Test 2: Test filtering by category (if we had the route)
    console.log('\n2️⃣ Testing Category Filtering...');
    const electronicsProducts = await axios.get(`${baseURL}/products?category=Electronics`);
    console.log(`✅ Electronics products: ${electronicsProducts.data.data?.length || 0}`);

    // Test 3: Test stock status filtering (if we had the route)
    console.log('\n3️⃣ Testing Stock Status Detection...');
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let inStockCount = 0;

    if (allProducts.data.data) {
      allProducts.data.data.forEach(product => {
        switch(product.stockStatus) {
          case 'low-stock':
            lowStockCount++;
            break;
          case 'out-of-stock':
            outOfStockCount++;
            break;
          case 'in-stock':
          case 'medium-stock':
            inStockCount++;
            break;
        }
      });
    }

    console.log(`   📊 Stock Analysis:`);
    console.log(`      - Low Stock: ${lowStockCount} products`);
    console.log(`      - Out of Stock: ${outOfStockCount} products`);
    console.log(`      - In Stock: ${inStockCount} products`);

    console.log('\n🎉 Static method tests completed!');
    console.log('\n💡 Note: To fully test static methods, we would need to implement the controller methods next!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

// Run the tests
testStaticMethods();
