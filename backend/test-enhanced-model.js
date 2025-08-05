// Test script for enhanced Product model features
const axios = require('axios');

const baseURL = 'http://localhost:5000/api';

async function testEnhancedProductModel() {
  console.log('🧪 Testing Enhanced Product Model Features...\n');

  try {
    // Test 1: Create a product to test virtual fields
    console.log('📝 Test 1: Creating a test product...');
    const newProduct = {
      name: 'Enhanced Test Product',
      reference: 'ETP001',
      price: 99.99,
      quantity: 15,
      category: 'Electronics',
      minStock: 10,
      description: 'Testing our enhanced Product model with virtual fields and methods'
    };

    const createResponse = await axios.post(`${baseURL}/products`, newProduct);
    console.log('✅ Product created:', createResponse.data);
    console.log('📊 Notice the virtual fields:');
    console.log(`   - totalValue: ${createResponse.data.data?.totalValue || 'Not calculated'}`);
    console.log(`   - stockStatus: ${createResponse.data.data?.stockStatus || 'Not calculated'}`);
    console.log(`   - isAvailable: ${createResponse.data.data?.isAvailable || 'Not calculated'}`);

    const productId = createResponse.data.data?._id || createResponse.data.data?.id;
    console.log('\n');

    // Test 2: Get all products to see our enhanced features
    console.log('📋 Test 2: Getting all products...');
    const getAllResponse = await axios.get(`${baseURL}/products`);
    console.log('✅ Products retrieved:', getAllResponse.data.data?.length || 0, 'products');
    
    if (getAllResponse.data.data && getAllResponse.data.data.length > 0) {
      const firstProduct = getAllResponse.data.data[0];
      console.log('📊 First product virtual fields:');
      console.log(`   - totalValue: ${firstProduct.totalValue}`);
      console.log(`   - stockStatus: ${firstProduct.stockStatus}`);
      console.log(`   - isAvailable: ${firstProduct.isAvailable}`);
    }
    
    console.log('\n🎉 Enhanced Product Model tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

// Run the tests
testEnhancedProductModel();
