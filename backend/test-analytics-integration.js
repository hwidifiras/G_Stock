/**
 * Test Analytics Integration
 * This script tests the analytics endpoints and data structure
 */

const axios = require('axios')

const API_BASE_URL = 'http://localhost:5000/api'

async function testAnalyticsEndpoints() {
  console.log('🧪 Testing Analytics Endpoints...\n')

  try {
    // Test Dashboard Analytics
    console.log('1. Testing Dashboard Analytics...')
    const dashboardResponse = await axios.get(`${API_BASE_URL}/analytics/dashboard`)
    
    if (dashboardResponse.data.success) {
      console.log('✅ Dashboard Analytics - Success')
      console.log('📊 Total Products:', dashboardResponse.data.data.totalProducts.value)
      console.log('💰 Total Value:', dashboardResponse.data.data.totalValue.value)
      console.log('⚠️  Low Stock:', dashboardResponse.data.data.lowStock.value)
      console.log('📦 Total Quantity:', dashboardResponse.data.data.totalQuantity.value)
      console.log('')
    } else {
      console.log('❌ Dashboard Analytics - Failed')
      console.log('Error:', dashboardResponse.data.message)
    }

    // Test Movements Analytics
    console.log('2. Testing Movements Analytics...')
    const movementsResponse = await axios.get(`${API_BASE_URL}/analytics/movements?timeframe=7d`)
    
    if (movementsResponse.data.success) {
      console.log('✅ Movements Analytics - Success')
      console.log('📈 Stock Movements:', movementsResponse.data.data.stockMovements?.length || 0, 'series')
      console.log('📅 Categories:', movementsResponse.data.data.categories?.length || 0, 'periods')
      console.log('')
    } else {
      console.log('❌ Movements Analytics - Failed')
      console.log('Error:', movementsResponse.data.message)
    }

    // Test Recent Activity
    console.log('3. Testing Recent Activity...')
    const activityResponse = await axios.get(`${API_BASE_URL}/analytics/activity?limit=5`)
    
    if (activityResponse.data.success) {
      console.log('✅ Recent Activity - Success')
      console.log('🔔 Activity Items:', activityResponse.data.data?.length || 0)
      if (activityResponse.data.data?.length > 0) {
        console.log('Latest Activity:', activityResponse.data.data[0].title)
      }
      console.log('')
    } else {
      console.log('❌ Recent Activity - Failed')
      console.log('Error:', activityResponse.data.message)
    }

    console.log('🎉 Analytics Integration Test Complete!')

  } catch (error) {
    console.error('❌ Test Failed:', error.message)
    if (error.response) {
      console.error('Response Status:', error.response.status)
      console.error('Response Data:', error.response.data)
    }
  }
}

// Run the test
testAnalyticsEndpoints()
