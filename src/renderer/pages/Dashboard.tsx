import { 
  Box, 
  Heading, 
  SimpleGrid, 
  Text,
  Flex,
  Icon,
  useColorModeValue,
  Grid,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react'
import { 
  MdInventory, 
  MdTrendingUp, 
  MdWarning, 
  MdAttachMoney
} from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { useDashboardAnalytics, useMovementsAnalytics } from '../hooks/useAnalytics'
import MiniStatistics from '../components/MiniStatistics'
import Card from '../components/Card'
import LineChart from '../components/LineChart'
import BarChart from '../components/BarChart'
import DonutChart from '../components/DonutChart'
import DashboardActions from '../components/DashboardActions'
import RecentActivity from '../components/RecentActivity'
import InventoryAlerts from '../components/InventoryAlerts'
import { ApexOptions } from 'apexcharts'

export default function Dashboard() {
  const navigate = useNavigate()
  const textColor = useColorModeValue("secondaryGray.900", "white")
  const cardBg = useColorModeValue("white", "navy.700")
  const iconBoxBg = useColorModeValue("brand.500", "brand.400")
  const mainBg = useColorModeValue("gray.50", "navy.800")
  const mutedTextColor = useColorModeValue("secondaryGray.600", "secondaryGray.400")

  // Fetch real analytics data
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError } = useDashboardAnalytics()
  const { data: movementsData, loading: movementsLoading, error: movementsError } = useMovementsAnalytics('7d')

  const handleNavigate = (path: string) => {
    navigate(path)
  }

  // Chart options
  const stockMovementOptions: ApexOptions = {
    chart: {
      type: 'line',
      toolbar: { show: false },
    },
    colors: ['#22C55E', '#EF4444'],
    stroke: {
      curve: 'smooth',
      width: 3
    },
    xaxis: {
      categories: movementsData?.categories || ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul']
    },
    tooltip: {
      theme: 'light'
    },
    grid: {
      show: true,
      borderColor: '#e2e8f0',
      strokeDashArray: 3
    }
  }

  const categoryDistributionData = dashboardData?.categoryDistribution ? [{
    name: "Quantités par Catégorie",
    data: dashboardData.categoryDistribution.map(cat => cat.totalQuantity)
  }] : []

  const categoryDistributionOptions: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false }
    },
    colors: ['#4285F4'],
    xaxis: {
      categories: dashboardData?.categoryDistribution?.map(cat => cat._id) || []
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        columnWidth: '60%'
      }
    }
  }

  const stockStatusData = dashboardData?.stockStatus ? [
    dashboardData.stockStatus.inStock,
    dashboardData.stockStatus.lowStock,
    dashboardData.stockStatus.outOfStock
  ] : []

  const stockStatusOptions: ApexOptions = {
    chart: {
      type: 'donut'
    },
    colors: ['#22C55E', '#F59E0B', '#EF4444'],
    labels: ['En Stock', 'Stock Faible', 'Rupture'],
    legend: {
      position: 'bottom'
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%'
        }
      }
    }
  }

  // Loading state
  if (dashboardLoading) {
    return (
      <Box bg={mainBg} minH="100vh" w="100%" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text color={textColor}>Chargement des données...</Text>
        </VStack>
      </Box>
    )
  }

  // Error state
  if (dashboardError || movementsError) {
    return (
      <Box bg={mainBg} minH="100vh" w="100%" p={6}>
        <Alert status="error">
          <AlertIcon />
          <Box>
            <AlertTitle>Erreur de chargement!</AlertTitle>
            <AlertDescription>
              {dashboardError || movementsError}
            </AlertDescription>
          </Box>
        </Alert>
      </Box>
    )
  }

  return (
    <Box bg={mainBg} minH="100vh" w="100%">
      <Heading size="lg" mb={6} color={textColor}>
        Tableau de Bord
      </Heading>
      
      {/* Quick Actions */}
      <DashboardActions onNavigate={handleNavigate} />
      
      {/* Statistics Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="20px" mb="20px" mt="20px">
        <MiniStatistics
          startContent={
            <Flex
              w="56px"
              h="56px"
              align="center"
              justify="center"
              bg={iconBoxBg}
              borderRadius="12px"
              color="white"
            >
              <Icon as={MdInventory} width="28px" height="28px" />
            </Flex>
          }
          name={dashboardData?.totalProducts?.label || "Total Produits"}
          value={dashboardData?.totalProducts?.value?.toString() || "0"}
          growth={dashboardData?.totalProducts?.growth || "0%"}
        />
        <MiniStatistics
          startContent={
            <Flex
              w="56px"
              h="56px"
              align="center"
              justify="center"
              bg={iconBoxBg}
              borderRadius="12px"
              color="white"
            >
              <Icon as={MdAttachMoney} width="28px" height="28px" />
            </Flex>
          }
          name={dashboardData?.totalValue?.label || "Valeur Totale"}
          value={dashboardData?.totalValue?.value || "€0"}
          growth={dashboardData?.totalValue?.growth || "0%"}
        />
        <MiniStatistics
          startContent={
            <Flex
              w="56px"
              h="56px"
              align="center"
              justify="center"
              bg={useColorModeValue("orange.400", "orange.300")}
              borderRadius="12px"
              color="white"
            >
              <Icon as={MdWarning} width="28px" height="28px" />
            </Flex>
          }
          name={dashboardData?.lowStock?.label || "Stock Faible"}
          value={dashboardData?.lowStock?.value?.toString() || "0"}
          growth={dashboardData?.lowStock?.growth || "0%"}
        />
        <MiniStatistics
          startContent={
            <Flex
              w="56px"
              h="56px"
              align="center"
              justify="center"
              bg={useColorModeValue("green.400", "green.300")}
              borderRadius="12px"
              color="white"
            >
              <Icon as={MdTrendingUp} width="28px" height="28px" />
            </Flex>
          }
          name={dashboardData?.totalQuantity?.label || "Stock Total"}
          value={dashboardData?.totalQuantity?.value?.toString() || "0"}
          growth={dashboardData?.totalQuantity?.growth || "0%"}
        />
      </SimpleGrid>
      
      {/* Charts and Activity Section */}
      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap="20px" mb="20px">
        {/* Charts Section */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing="20px">
          {/* Stock Movement Chart */}
          <Card bg={cardBg} p="20px">
            <Text fontSize="lg" fontWeight="bold" mb="20px" color={textColor}>
              Mouvements de Stock {movementsLoading && <Spinner size="sm" ml={2} />}
            </Text>
            <Box h="300px">
              {movementsData?.stockMovements ? (
                <LineChart
                  chartData={movementsData.stockMovements}
                  chartOptions={stockMovementOptions}
                  height="100%"
                />
              ) : (
                                <Box textAlign="center">
                  <Text color={mutedTextColor}>Aucune donnée de mouvement disponible</Text>
                </Box>
              )}
            </Box>
          </Card>
          
          {/* Stock Status Distribution */}
          <Card bg={cardBg} p="20px">
            <Text fontSize="lg" fontWeight="bold" mb="20px" color={textColor}>
              Statut du Stock
            </Text>
            <Box h="300px">
              {stockStatusData.length > 0 ? (
                <DonutChart
                  chartData={stockStatusData}
                  chartOptions={stockStatusOptions}
                  height="100%"
                />
              ) : (
                <Flex h="100%" alignItems="center" justifyContent="center">
                  <Text color={mutedTextColor}>Aucune donnée de statut disponible</Text>
                </Flex>
              )}
            </Box>
          </Card>
        </SimpleGrid>
        
        {/* Recent Activity and Alerts */}
        <VStack spacing="20px">
          <RecentActivity maxItems={6} />
          <InventoryAlerts maxItems={4} />
        </VStack>
      </Grid>
      
      {/* Category Distribution */}
      <Card bg={cardBg} p="20px">
        <Text fontSize="lg" fontWeight="bold" mb="20px" color={textColor}>
          Distribution par Catégorie
        </Text>
        <Box h="350px">
          {categoryDistributionData.length > 0 ? (
            <BarChart
              chartData={categoryDistributionData}
              chartOptions={categoryDistributionOptions}
              height="100%"
            />
          ) : (
            <Flex h="100%" alignItems="center" justifyContent="center">
              <Text color={mutedTextColor}>Aucune donnée de catégorie disponible</Text>
            </Flex>
          )}
        </Box>
      </Card>
    </Box>
  )
}
