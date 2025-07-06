import { 
  Box, 
  Heading, 
  SimpleGrid, 
  Text,
  Flex,
  Icon,
  useColorModeValue,
  Grid,
  VStack
} from '@chakra-ui/react'
import { 
  MdInventory, 
  MdTrendingUp, 
  MdWarning, 
  MdAttachMoney
} from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
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

  const handleNavigate = (path: string) => {
    navigate(path)
  }

  // Mock data for charts
  const stockMovementData = [
    {
      name: "Entrées",
      data: [44, 55, 57, 56, 61, 58, 63, 60, 66, 72, 68, 70]
    },
    {
      name: "Sorties", 
      data: [76, 85, 101, 98, 87, 105, 91, 114, 94, 86, 115, 108]
    }
  ]

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
      categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
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

  const categoryDistributionData = [
    {
      name: "Quantités par Catégorie",
      data: [150, 230, 180, 120, 90, 75]
    }
  ]

  const categoryDistributionOptions: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false }
    },
    colors: ['#4285F4'],
    xaxis: {
      categories: ['Électronique', 'Vêtements', 'Maison', 'Sports', 'Livres', 'Jouets']
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        columnWidth: '60%'
      }
    }
  }

  const stockStatusData = [45, 25, 15, 15] // En stock, Stock faible, Rupture, Commandé

  const stockStatusOptions: ApexOptions = {
    chart: {
      type: 'donut'
    },
    colors: ['#22C55E', '#F59E0B', '#EF4444', '#3B82F6'],
    labels: ['En Stock', 'Stock Faible', 'Rupture', 'Commandé'],
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

  return (
    <Box>
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
          name="Total Produits"
          value="1,247"
          growth="+12%"
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
          name="Valeur Totale"
          value="€184,750"
          growth="+8.2%"
        />
        
        <MiniStatistics
          startContent={
            <Flex
              w="56px"
              h="56px"
              align="center"
              justify="center"
              bg="orange.400"
              borderRadius="12px"
              color="white"
            >
              <Icon as={MdWarning} width="28px" height="28px" />
            </Flex>
          }
          name="Stock Faible"
          value="23"
          growth="-15%"
        />
        
        <MiniStatistics
          startContent={
            <Flex
              w="56px"
              h="56px"
              align="center"
              justify="center"
              bg="green.400"
              borderRadius="12px"
              color="white"
            >
              <Icon as={MdTrendingUp} width="28px" height="28px" />
            </Flex>
          }
          name="Mouvements"
          value="856"
          growth="+23%"
        />
      </SimpleGrid>

      {/* Charts and Activity Section */}
      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap="20px" mb="20px">
        {/* Charts Section */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing="20px">
          {/* Stock Movement Chart */}
          <Card bg={cardBg} p="20px">
            <Text fontSize="lg" fontWeight="bold" mb="20px" color={textColor}>
              Mouvements de Stock (2024)
            </Text>
            <Box h="300px">
              <LineChart
                chartData={stockMovementData}
                chartOptions={stockMovementOptions}
                height="100%"
              />
            </Box>
          </Card>

          {/* Stock Status Distribution */}
          <Card bg={cardBg} p="20px">
            <Text fontSize="lg" fontWeight="bold" mb="20px" color={textColor}>
              Statut du Stock
            </Text>
            <Box h="300px">
              <DonutChart
                chartData={stockStatusData}
                chartOptions={stockStatusOptions}
                height="100%"
              />
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
          <BarChart
            chartData={categoryDistributionData}
            chartOptions={categoryDistributionOptions}
            height="100%"
          />
        </Box>
      </Card>
    </Box>
  )
}
