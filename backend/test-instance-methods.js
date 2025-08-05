// Test script for enhanced Product model instance methods
const axios = require('axios');

const baseURL = 'http://localhost:5000/api';

async function testInstanceMethods() {
  console.log('🧪 Testing Product Instance Methods...\n');

  try {
    // First, let's create a product to test methods on
    console.log('📝 Creating a test product...');
    const newProduct = {
      name: 'Method Test Product',
      reference: 'MTP001',
      price: 50.00,
      quantity: 8,
      category: 'Testing',
      minStock: 10,
      description: 'Product for testing instance methods'
    };

    const createResponse = await axios.post(`${baseURL}/products`, newProduct);
    const product = createResponse.data.data;
    console.log('✅ Product created:', product.name);
    console.log(`📊 Initial stock: ${product.quantity}, Min stock: ${product.minStock}`);
    console.log(`📊 Stock status: ${product.stockStatus} (should be 'low-stock')`);
    console.log(`📊 Is low stock: ${product.quantity <= product.minStock ? 'Yes' : 'No'}`);

    // Let's also test the low stock detection
    console.log('\n📊 Testing Low Stock Detection:');
    console.log(`   - Quantity: ${product.quantity}`);
    console.log(`   - Min Stock: ${product.minStock}`);
    console.log(`   - Is Low Stock: ${product.quantity <= product.minStock ? 'YES' : 'NO'}`);
    console.log(`   - Stock Status: ${product.stockStatus}`);

    if (product.stockStatus === 'low-stock') {
      console.log('✅ Low stock detection working correctly!');
    } else {
      console.log('⚠️  Expected low-stock but got:', product.stockStatus);
    }

    console.log('\n🎉 Instance method tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

// Run the tests
testInstanceMethods();
