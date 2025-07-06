import {
  Box,
  Text,
  useColorModeValue,
  VStack,
  HStack,
  Badge,
  Progress,
  Icon
} from '@chakra-ui/react'
import { MdTrendingUp, MdTrendingDown, MdRemove } from 'react-icons/md'
import Card from './Card'

interface InventoryAlert {
  id: string
  product: string
  currentStock: number
  minimumStock: number
  category: string
  status: 'critical' | 'warning' | 'good'
}

interface InventoryAlertsProps {
  alerts?: InventoryAlert[]
  maxItems?: number
}

export default function InventoryAlerts({ 
  alerts = [], 
  maxItems = 6 
}: InventoryAlertsProps) {
  const cardBg = useColorModeValue("white", "navy.700")
  const textColor = useColorModeValue("secondaryGray.900", "white")
  const borderColor = useColorModeValue("gray.200", "navy.600")
  const mutedColor = useColorModeValue("secondaryGray.600", "secondaryGray.300")

  // Mock data if no alerts provided
  const defaultAlerts: InventoryAlert[] = [
    {
      id: '1',
      product: 'iPhone 14 Pro Max',
      currentStock: 2,
      minimumStock: 10,
      category: 'Électronique',
      status: 'critical'
    },
    {
      id: '2',
      product: 'Samsung Galaxy S23',
      currentStock: 5,
      minimumStock: 15,
      category: 'Électronique', 
      status: 'warning'
    },
    {
      id: '3',
      product: 'MacBook Air M2',
      currentStock: 8,
      minimumStock: 12,
      category: 'Informatique',
      status: 'warning'
    },
    {
      id: '4',
      product: 'AirPods Pro 2',
      currentStock: 1,
      minimumStock: 20,
      category: 'Audio',
      status: 'critical'
    }
  ]

  const displayAlerts = (alerts.length > 0 ? alerts : defaultAlerts).slice(0, maxItems)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'red'
      case 'warning':
        return 'orange'
      default:
        return 'green'
    }
  }

  const getStatusIcon = (current: number, minimum: number) => {
    const ratio = current / minimum
    if (ratio < 0.3) return MdTrendingDown
    if (ratio < 0.7) return MdRemove
    return MdTrendingUp
  }

  const getStockPercentage = (current: number, minimum: number) => {
    return Math.min((current / minimum) * 100, 100)
  }

  return (
    <Card bg={cardBg} p="20px" border="1px solid" borderColor={borderColor}>
      <Text fontSize="lg" fontWeight="bold" mb="20px" color={textColor}>
        Alertes Stock
      </Text>

      <VStack spacing="15px" align="stretch">
        {displayAlerts.map((alert) => (
          <Box key={alert.id} p="15px" bg={useColorModeValue("gray.50", "navy.800")} rounded="lg">
            <HStack justify="space-between" mb="10px">
              <VStack align="start" spacing="2px">
                <Text fontSize="sm" fontWeight="600" color={textColor}>
                  {alert.product}
                </Text>
                <Text fontSize="xs" color={mutedColor}>
                  {alert.category}
                </Text>
              </VStack>
              
              <VStack align="end" spacing="2px">
                <HStack>
                  <Icon 
                    as={getStatusIcon(alert.currentStock, alert.minimumStock)} 
                    color={`${getStatusColor(alert.status)}.500`}
                    w="16px" 
                    h="16px" 
                  />
                  <Badge colorScheme={getStatusColor(alert.status)} size="sm">
                    {alert.status === 'critical' ? 'Critique' : 'Attention'}
                  </Badge>
                </HStack>
                <Text fontSize="xs" color={mutedColor}>
                  {alert.currentStock}/{alert.minimumStock} min
                </Text>
              </VStack>
            </HStack>
            
            <Progress 
              value={getStockPercentage(alert.currentStock, alert.minimumStock)}
              colorScheme={getStatusColor(alert.status)}
              size="sm"
              bg={useColorModeValue("gray.200", "navy.700")}
              rounded="full"
            />
          </Box>
        ))}
      </VStack>
      
      {displayAlerts.length === 0 && (
        <Text fontSize="sm" color={mutedColor} textAlign="center" py="20px">
          Aucune alerte de stock
        </Text>
      )}
    </Card>
  )
}
