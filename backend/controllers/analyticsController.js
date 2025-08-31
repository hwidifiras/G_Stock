/**
 * Analytics Controller
 * Provides real-time dashboard statistics and chart data
 */

const Product = require('../models/Product');

/**
 * @desc    Get dashboard analytics
 * @route   GET /api/analytics/dashboard
 * @access  Public
 */
const getDashboardAnalytics = async (req, res) => {
  try {
    // Get total products count
    const totalProducts = await Product.countDocuments({ status: 'active' });
    
    // Get total stock value
    const stockValueResult = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$quantity', '$price'] } },
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);
    
    const totalValue = stockValueResult.length > 0 ? stockValueResult[0].totalValue : 0;
    const totalQuantity = stockValueResult.length > 0 ? stockValueResult[0].totalQuantity : 0;
    
    // Get low stock products count
    const lowStockCount = await Product.countDocuments({
      $expr: { $lte: ['$quantity', '$minStock'] },
      status: 'active'
    });
    
    // Get out of stock count
    const outOfStockCount = await Product.countDocuments({
      quantity: 0,
      status: 'active'
    });
    
    // Get category distribution
    const categoryDistribution = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$price'] } }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Calculate growth percentages (mock calculation for now)
    const previousMonthTotal = Math.floor(totalProducts * 0.9); // Simulate 10% growth
    const productsGrowth = totalProducts > 0 ? 
      (((totalProducts - previousMonthTotal) / previousMonthTotal) * 100).toFixed(1) : '0';
    
    const previousMonthValue = totalValue * 0.92; // Simulate 8% growth
    const valueGrowth = totalValue > 0 ? 
      (((totalValue - previousMonthValue) / previousMonthValue) * 100).toFixed(1) : '0';

    res.status(200).json({
      success: true,
      data: {
        totalProducts: {
          value: totalProducts,
          growth: `+${productsGrowth}%`,
          label: 'Total Produits'
        },
        totalValue: {
          value: `€${totalValue.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}`,
          growth: `+${valueGrowth}%`,
          label: 'Valeur Totale'
        },
        lowStock: {
          value: lowStockCount,
          growth: lowStockCount > 5 ? '-15%' : '+5%',
          label: 'Stock Faible'
        },
        totalQuantity: {
          value: totalQuantity,
          growth: '+23%',
          label: 'Total Quantité'
        },
        categoryDistribution,
        stockStatus: {
          inStock: totalProducts - lowStockCount - outOfStockCount,
          lowStock: lowStockCount,
          outOfStock: outOfStockCount,
          total: totalProducts
        }
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        dataFreshness: 'real-time'
      }
    });

  } catch (error) {
    console.error('Error in getDashboardAnalytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard analytics',
      error: error.message
    });
  }
};

/**
 * @desc    Get stock movements analytics (simulated)
 * @route   GET /api/analytics/movements
 * @access  Public
 */
const getMovementsAnalytics = async (req, res) => {
  try {
    const { period = '12m' } = req.query;
    
    // For now, we'll generate realistic data based on current products
    const totalProducts = await Product.countDocuments({ status: 'active' });
    
    // Generate monthly data (simulated based on product count)
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    const baseEntries = Math.floor(totalProducts * 0.05); // 5% of products per month
    const baseExits = Math.floor(totalProducts * 0.08);   // 8% of products per month
    
    const entriesData = months.map(() => 
      baseEntries + Math.floor(Math.random() * 20) // Add some variation
    );
    
    const exitsData = months.map(() => 
      baseExits + Math.floor(Math.random() * 30) // Add more variation to exits
    );

    res.status(200).json({
      success: true,
      data: {
        stockMovements: [
          {
            name: "Entrées",
            data: entriesData
          },
          {
            name: "Sorties",
            data: exitsData
          }
        ],
        categories: months,
        summary: {
          totalEntries: entriesData.reduce((a, b) => a + b, 0),
          totalExits: exitsData.reduce((a, b) => a + b, 0),
          netMovement: entriesData.reduce((a, b) => a + b, 0) - exitsData.reduce((a, b) => a + b, 0)
        }
      },
      metadata: {
        period,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in getMovementsAnalytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching movements analytics',
      error: error.message
    });
  }
};

/**
 * @desc    Get recent activity (simulated)
 * @route   GET /api/analytics/activity
 * @access  Public
 */
const getRecentActivity = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Get recently created products
    const recentProducts = await Product.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('name reference createdAt quantity category');
    
    // Convert to activity format
    const activities = recentProducts.map(product => ({
      id: product._id,
      type: 'product_created',
      title: `Nouveau produit ajouté`,
      description: `${product.name} (${product.reference})`,
      timestamp: product.createdAt,
      icon: 'add',
      data: {
        productId: product._id,
        productName: product.name,
        quantity: product.quantity,
        category: product.category
      }
    }));

    res.status(200).json({
      success: true,
      data: activities,
      count: activities.length,
      metadata: {
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in getRecentActivity:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recent activity',
      error: error.message
    });
  }
};

// Get reports analytics (new function for Reports page)
const getReportsAnalytics = async (req, res) => {
  try {
    const { timeframe = 'year', category = 'all' } = req.query
    
    // Get inventory value over time (mock data for now)
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
    const currentTotal = await Product.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, totalValue: { $sum: { $multiply: ['$quantity', '$price'] } } } }
    ])
    
    const baseValue = currentTotal[0]?.totalValue || 100000
    const inventoryValueData = [{
      name: "Valeur Stock",
      data: months.map((_, index) => {
        // Generate realistic fluctuation around current value
        const variation = (Math.random() - 0.5) * 0.2 // ±10% variation
        return Math.round(baseValue * (1 + variation))
      })
    }]

    // Get top products by value
    const topProducts = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $addFields: {
          totalValue: { $multiply: ['$quantity', '$price'] }
        }
      },
      { $sort: { totalValue: -1 } },
      { $limit: 8 },
      {
        $project: {
          name: 1,
          quantity: 1,
          totalValue: 1
        }
      }
    ])

    const topProductsData = [{
      name: "Valeur Stock",
      data: topProducts.map(p => p.totalValue)
    }]

    const topProductsCategories = topProducts.map(p => p.name.substring(0, 20))

    // Get category distribution
    const categoryDistribution = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$category',
          totalValue: { $sum: { $multiply: ['$quantity', '$price'] } },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalValue: -1 } }
    ])

    const categoryDistributionData = categoryDistribution.map(cat => cat.totalValue)
    const categoryLabels = categoryDistribution.map(cat => cat._id || 'Non défini')

    // Calculate KPIs
    const totalProducts = await Product.countDocuments({ status: 'active' })
    const totalValue = currentTotal[0]?.totalValue || 0
    const avgProductValue = totalProducts > 0 ? totalValue / totalProducts : 0
    
    // Low stock alerts
    const lowStockCount = await Product.countDocuments({
      status: 'active',
      $expr: { $lte: ['$quantity', '$minStock'] }
    })

    const reportsData = {
      inventoryValue: {
        data: inventoryValueData,
        categories: months
      },
      topProducts: {
        data: topProductsData,
        categories: topProductsCategories
      },
      categoryDistribution: {
        data: categoryDistributionData,
        labels: categoryLabels
      },
      kpis: {
        totalProducts,
        totalValue,
        avgProductValue,
        lowStockCount,
        stockTurnover: 2.3, // Mock value
        profitMargin: 15.7 // Mock value
      }
    }

    res.json({
      success: true,
      data: reportsData
    })

  } catch (error) {
    console.error('Error getting reports analytics:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des analyses de rapports',
      error: error.message
    })
  }
}

module.exports = {
  getDashboardAnalytics,
  getMovementsAnalytics,
  getRecentActivity,
  getReportsAnalytics
};
