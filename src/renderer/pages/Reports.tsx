import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  Button,
  useColorModeValue,
  VStack,
  HStack,
  Select,
  Input,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow
} from '@chakra-ui/react'
import { 
  MdFileDownload, 
  MdPrint,
  MdShare
} from 'react-icons/md'
import { useState } from 'react'
import Card from '../components/Card'
import LineChart from '../components/LineChart'
import BarChart from '../components/BarChart'
import DonutChart from '../components/DonutChart'
import { ApexOptions } from 'apexcharts'

export default function Reports() {
  const [reportType, setReportType] = useState('inventory')
  const [dateRange, setDateRange] = useState('month')
  const [category, setCategory] = useState('all')

  const cardBg = useColorModeValue("white", "navy.700")
  const textColor = useColorModeValue("secondaryGray.900", "white")
  const borderColor = useColorModeValue("gray.200", "navy.600")

  // Mock data for reports
  const inventoryValueData = [
    {
      name: "Valeur Stock",
      data: [120000, 125000, 118000, 132000, 128000, 135000, 142000, 138000, 145000, 150000, 148000, 155000]
    }
  ]

  const inventoryValueOptions: ApexOptions = {
    chart: {
      type: 'line',
      toolbar: { show: false },
    },
    colors: ['#4285F4'],
    stroke: {
      curve: 'smooth',
      width: 3
    },
    xaxis: {
      categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
    },
    yaxis: {
      labels: {
        formatter: function (val) {
          return '€' + (val / 1000).toFixed(0) + 'k'
        }
      }
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return '€' + val.toLocaleString()
        }
      }
    }
  }

  const topProductsData = [
    {
      name: "Ventes (unités)",
      data: [150, 120, 95, 85, 75, 65, 55, 45]
    }
  ]

  const topProductsOptions: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false }
    },
    colors: ['#22C55E'],
    xaxis: {
      categories: ['iPhone 14', 'Galaxy S23', 'MacBook Air', 'iPad Pro', 'AirPods Pro', 'Surface Pro', 'Watch Series', 'Pixel 7']
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true
      }
    }
  }

  const categoryDistributionData = [245, 180, 120, 95, 75, 60]
  
  const categoryDistributionOptions: ApexOptions = {
    chart: {
      type: 'donut'
    },
    colors: ['#4285F4', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'],
    labels: ['Électronique', 'Informatique', 'Audio', 'Accessoires', 'Gaming', 'Autres'],
    legend: {
      position: 'bottom'
    }
  }

  const handleExportReport = (format: string) => {
    console.log(`Exporting report as ${format}`)
    // Here you would implement actual export functionality
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" color={textColor}>
          Rapports et Analytics
        </Heading>
        <HStack spacing={3}>
          <Button leftIcon={<MdPrint />} variant="outline">
            Imprimer
          </Button>
          <Button leftIcon={<MdShare />} variant="outline">
            Partager
          </Button>
          <Button 
            leftIcon={<MdFileDownload />} 
            colorScheme="brand"
            onClick={() => handleExportReport('excel')}
          >
            Exporter
          </Button>
        </HStack>
      </Flex>

      {/* Report Filters */}
      <Card bg={cardBg} p="20px" mb="20px" border="1px solid" borderColor={borderColor}>
        <VStack spacing="15px">
          <HStack spacing="20px" w="100%" flexWrap="wrap">
            <Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              maxW="200px"
            >
              <option value="inventory">Rapport d'inventaire</option>
              <option value="sales">Rapport des ventes</option>
              <option value="movements">Mouvements de stock</option>
              <option value="profitability">Rentabilité</option>
            </Select>
            
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              maxW="200px"
            >
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="quarter">Ce trimestre</option>
              <option value="year">Cette année</option>
              <option value="custom">Période personnalisée</option>
            </Select>
            
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              maxW="200px"
            >
              <option value="all">Toutes catégories</option>
              <option value="electronics">Électronique</option>
              <option value="computers">Informatique</option>
              <option value="audio">Audio</option>
              <option value="accessories">Accessoires</option>
            </Select>

            <Input
              type="date"
              placeholder="Date début"
              maxW="150px"
            />
            <Input
              type="date"
              placeholder="Date fin"
              maxW="150px"
            />
          </HStack>
        </VStack>
      </Card>

      <Tabs variant="enclosed" colorScheme="brand">
        <TabList>
          <Tab>Vue d'ensemble</Tab>
          <Tab>Analyse des ventes</Tab>
          <Tab>Inventaire détaillé</Tab>
          <Tab>Performance produits</Tab>
        </TabList>

        <TabPanels>
          {/* Overview Tab */}
          <TabPanel px={0}>
            {/* Key Metrics */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="20px" mb="20px">
              <Card bg={cardBg} p="20px" border="1px solid" borderColor={borderColor}>
                <Stat>
                  <StatLabel>Valeur totale du stock</StatLabel>
                  <StatNumber>€155,240</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    +8.2% ce mois
                  </StatHelpText>
                </Stat>
              </Card>
              
              <Card bg={cardBg} p="20px" border="1px solid" borderColor={borderColor}>
                <Stat>
                  <StatLabel>Rotation des stocks</StatLabel>
                  <StatNumber>4.2x</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    +0.3x vs mois précédent
                  </StatHelpText>
                </Stat>
              </Card>
              
              <Card bg={cardBg} p="20px" border="1px solid" borderColor={borderColor}>
                <Stat>
                  <StatLabel>Marge brute moyenne</StatLabel>
                  <StatNumber>28.5%</StatNumber>
                  <StatHelpText>
                    <StatArrow type="decrease" />
                    -1.2% vs objectif
                  </StatHelpText>
                </Stat>
              </Card>
              
              <Card bg={cardBg} p="20px" border="1px solid" borderColor={borderColor}>
                <Stat>
                  <StatLabel>Produits en rupture</StatLabel>
                  <StatNumber>7</StatNumber>
                  <StatHelpText>
                    <StatArrow type="decrease" />
                    -3 vs semaine dernière
                  </StatHelpText>
                </Stat>
              </Card>
            </SimpleGrid>

            {/* Charts */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing="20px">
              <Card bg={cardBg} p="20px" border="1px solid" borderColor={borderColor}>
                <Text fontSize="lg" fontWeight="bold" mb="20px" color={textColor}>
                  Évolution de la valeur du stock
                </Text>
                <Box h="300px">
                  <LineChart
                    chartData={inventoryValueData}
                    chartOptions={inventoryValueOptions}
                    height="100%"
                  />
                </Box>
              </Card>

              <Card bg={cardBg} p="20px" border="1px solid" borderColor={borderColor}>
                <Text fontSize="lg" fontWeight="bold" mb="20px" color={textColor}>
                  Répartition par catégorie
                </Text>
                <Box h="300px">
                  <DonutChart
                    chartData={categoryDistributionData}
                    chartOptions={categoryDistributionOptions}
                    height="100%"
                  />
                </Box>
              </Card>
            </SimpleGrid>
          </TabPanel>

          {/* Sales Analysis Tab */}
          <TabPanel px={0}>
            <Card bg={cardBg} p="20px" border="1px solid" borderColor={borderColor}>
              <Text fontSize="lg" fontWeight="bold" mb="20px" color={textColor}>
                Top des produits vendus
              </Text>
              <Box h="400px">
                <BarChart
                  chartData={topProductsData}
                  chartOptions={topProductsOptions}
                  height="100%"
                />
              </Box>
            </Card>
          </TabPanel>

          {/* Detailed Inventory Tab */}
          <TabPanel px={0}>
            <Card bg={cardBg} p="20px" border="1px solid" borderColor={borderColor}>
              <Text fontSize="lg" fontWeight="bold" mb="20px" color={textColor}>
                Inventaire détaillé par produit
              </Text>
              <Text color="gray.500">
                Tableau détaillé des stocks avec valeurs, rotations et alertes...
              </Text>
              {/* Here you would add a detailed inventory table */}
            </Card>
          </TabPanel>

          {/* Product Performance Tab */}
          <TabPanel px={0}>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing="20px">
              <Card bg={cardBg} p="20px" border="1px solid" borderColor={borderColor}>
                <Text fontSize="lg" fontWeight="bold" mb="20px" color={textColor}>
                  Produits les plus rentables
                </Text>
                <VStack spacing="15px" align="stretch">
                  {[
                    { name: 'iPhone 14 Pro', margin: '32%', color: 'green' },
                    { name: 'MacBook Air M2', margin: '28%', color: 'green' },
                    { name: 'AirPods Pro 2', margin: '25%', color: 'yellow' },
                    { name: 'iPad Pro', margin: '22%', color: 'yellow' },
                    { name: 'Galaxy S23', margin: '18%', color: 'red' }
                  ].map((product, index) => (
                    <Flex key={index} justify="space-between" align="center" p="10px" bg="gray.50" rounded="md">
                      <Text fontWeight="500">{product.name}</Text>
                      <Badge colorScheme={product.color}>{product.margin}</Badge>
                    </Flex>
                  ))}
                </VStack>
              </Card>

              <Card bg={cardBg} p="20px" border="1px solid" borderColor={borderColor}>
                <Text fontSize="lg" fontWeight="bold" mb="20px" color={textColor}>
                  Produits à faible rotation
                </Text>
                <VStack spacing="15px" align="stretch">
                  {[
                    { name: 'Surface Pro 9', days: '45 jours', color: 'red' },
                    { name: 'Watch Series 8', days: '32 jours', color: 'orange' },
                    { name: 'Pixel 7 Pro', days: '28 jours', color: 'orange' },
                    { name: 'Tab S8 Ultra', days: '25 jours', color: 'yellow' },
                    { name: 'Studio Display', days: '22 jours', color: 'yellow' }
                  ].map((product, index) => (
                    <Flex key={index} justify="space-between" align="center" p="10px" bg="gray.50" rounded="md">
                      <Text fontWeight="500">{product.name}</Text>
                      <Badge colorScheme={product.color}>{product.days}</Badge>
                    </Flex>
                  ))}
                </VStack>
              </Card>
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}
