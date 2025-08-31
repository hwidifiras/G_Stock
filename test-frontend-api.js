/**
 * Quick test to verify API integration
 * Run this in the browser console when the app is open
 */

// Test creating a product
async function testCreateProduct() {
  try {
    console.log('🧪 Testing Product Creation...')
    
    const productData = {
      name: 'Test Product from Frontend',
      reference: 'TEST-001',
      quantity: 10,
      price: 29.99,
      category: 'Électronique',
      description: 'Product created from frontend integration test',
      minStock: 2,
      unit: 'pièce',
      status: 'active'
    }

    const response = await fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    })

    const result = await response.json()
    
    if (result.success) {
      console.log('✅ Product created successfully:', result.data)
    } else {
      console.error('❌ Failed to create product:', result)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Test getting all products
async function testGetProducts() {
  try {
    console.log('🧪 Testing Get Products...')
    
    const response = await fetch('http://localhost:5000/api/products')
    const result = await response.json()
    
    if (result.success) {
      console.log('✅ Products fetched successfully:', result.data)
      console.log(`📊 Found ${result.count} products`)
    } else {
      console.error('❌ Failed to fetch products:', result)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Test analytics endpoints
async function testAnalytics() {
  try {
    console.log('🧪 Testing Analytics Endpoints...')
    
    // Test Dashboard Analytics
    console.log('📊 Testing Dashboard Analytics...')
    const dashboardResponse = await fetch('http://localhost:5000/api/analytics/dashboard')
    const dashboardResult = await dashboardResponse.json()
    
    if (dashboardResult.success) {
      console.log('✅ Dashboard Analytics - Success')
      console.log('📈 Total Products:', dashboardResult.data.totalProducts.value)
      console.log('💰 Total Value:', dashboardResult.data.totalValue.value)
      console.log('⚠️ Low Stock:', dashboardResult.data.lowStock.value)
    } else {
      console.error('❌ Dashboard Analytics failed:', dashboardResult)
    }

    // Test Movements Analytics
    console.log('📈 Testing Movements Analytics...')
    const movementsResponse = await fetch('http://localhost:5000/api/analytics/movements?timeframe=7d')
    const movementsResult = await movementsResponse.json()
    
    if (movementsResult.success) {
      console.log('✅ Movements Analytics - Success')
      console.log('📊 Chart Series:', movementsResult.data.stockMovements?.length || 0)
      console.log('📅 Time Periods:', movementsResult.data.categories?.length || 0)
    } else {
      console.error('❌ Movements Analytics failed:', movementsResult)
    }

    // Test Reports Analytics
    console.log('📋 Testing Reports Analytics...')
    const reportsResponse = await fetch('http://localhost:5000/api/analytics/reports')
    const reportsResult = await reportsResponse.json()
    
    if (reportsResult.success) {
      console.log('✅ Reports Analytics - Success')
      console.log('📊 KPIs Available:', Object.keys(reportsResult.data.kpis).length)
      console.log('🏷️ Categories:', reportsResult.data.categoryDistribution.labels?.length || 0)
    } else {
      console.error('❌ Reports Analytics failed:', reportsResult)
    }

    // Test Recent Activity
    console.log('🔔 Testing Recent Activity...')
    const activityResponse = await fetch('http://localhost:5000/api/analytics/activity?limit=5')
    const activityResult = await activityResponse.json()
    
    if (activityResult.success) {
      console.log('✅ Recent Activity - Success')
      console.log('📝 Activity Items:', activityResult.data?.length || 0)
      if (activityResult.data?.length > 0) {
        console.log('🆕 Latest:', activityResult.data[0].title)
      }
    } else {
      console.error('❌ Recent Activity failed:', activityResult)
    }
    
  } catch (error) {
    console.error('❌ Analytics test failed:', error)
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Full API Integration Tests...\n')
  await testCreateProduct()
  console.log('')
  await testGetProducts()
  console.log('')
  await testAnalytics()
  console.log('\n🎉 All tests completed!')
}

console.log('🎯 API Integration Test Functions Available:')
console.log('- testCreateProduct()')
console.log('- testGetProducts()')
console.log('- testAnalytics()')
console.log('- runTests()')
console.log('')
console.log('💡 Run runTests() to test the full integration!')
console.log('📊 Run testAnalytics() to test just the analytics endpoints!')
