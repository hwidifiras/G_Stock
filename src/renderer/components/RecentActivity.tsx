import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Avatar,
  useColorModeValue,
  Divider,
  Button,
  Flex
} from '@chakra-ui/react'
import { MdArrowUpward, MdArrowDownward, MdEdit, MdAdd } from 'react-icons/md'
import Card from './Card'

interface ActivityItem {
  id: string
  type: 'entry' | 'exit' | 'edit' | 'add'
  product: string
  quantity?: number
  user: string
  timestamp: string
  description: string
}

interface RecentActivityProps {
  activities?: ActivityItem[]
  maxItems?: number
}

export default function RecentActivity({ 
  activities = [], 
  maxItems = 5 
}: RecentActivityProps) {
  const cardBg = useColorModeValue("white", "navy.700")
  const textColor = useColorModeValue("secondaryGray.900", "white")
  const borderColor = useColorModeValue("gray.200", "navy.600")
  const mutedColor = useColorModeValue("secondaryGray.600", "secondaryGray.300")

  // Mock data if no activities provided
  const defaultActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'entry',
      product: 'iPhone 14 Pro',
      quantity: 25,
      user: 'Admin',
      timestamp: 'Il y a 2 minutes',
      description: 'Entrée de stock'
    },
    {
      id: '2', 
      type: 'exit',
      product: 'Samsung Galaxy S23',
      quantity: 3,
      user: 'Vendeur1',
      timestamp: 'Il y a 15 minutes',
      description: 'Vente client'
    },
    {
      id: '3',
      type: 'edit',
      product: 'MacBook Air M2',
      user: 'Admin',
      timestamp: 'Il y a 1 heure',
      description: 'Mise à jour du prix'
    },
    {
      id: '4',
      type: 'add',
      product: 'AirPods Pro 2',
      user: 'Admin', 
      timestamp: 'Il y a 2 heures',
      description: 'Nouveau produit ajouté'
    },
    {
      id: '5',
      type: 'exit',
      product: 'iPad Pro 12.9"',
      quantity: 1,
      user: 'Vendeur2',
      timestamp: 'Il y a 3 heures',
      description: 'Vente en ligne'
    }
  ]

  const displayActivities = (activities.length > 0 ? activities : defaultActivities).slice(0, maxItems)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'entry':
        return MdArrowUpward
      case 'exit':
        return MdArrowDownward
      case 'edit':
        return MdEdit
      case 'add':
        return MdAdd
      default:
        return MdEdit
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'entry':
        return 'green'
      case 'exit':
        return 'red'
      case 'edit':
        return 'blue'
      case 'add':
        return 'purple'
      default:
        return 'gray'
    }
  }

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'entry':
        return 'Entrée'
      case 'exit':
        return 'Sortie'
      case 'edit':
        return 'Modifié'
      case 'add':
        return 'Ajouté'
      default:
        return 'Action'
    }
  }

  return (
    <Card bg={cardBg} p="20px" border="1px solid" borderColor={borderColor}>
      <Flex justify="space-between" align="center" mb="20px">
        <Text fontSize="lg" fontWeight="bold" color={textColor}>
          Activité Récente
        </Text>
        <Button size="sm" variant="ghost" colorScheme="brand">
          Voir tout
        </Button>
      </Flex>

      <VStack spacing="15px" align="stretch">
        {displayActivities.map((activity, index) => (
          <Box key={activity.id}>
            <HStack spacing="15px" align="start">
              <Avatar
                size="sm"
                bg={`${getActivityColor(activity.type)}.500`}
                icon={<Box as={getActivityIcon(activity.type)} w="16px" h="16px" color="white" />}
              />
              
              <Box flex="1">
                <HStack justify="space-between" mb="5px">
                  <Text fontSize="sm" fontWeight="600" color={textColor}>
                    {activity.product}
                  </Text>
                  <Badge colorScheme={getActivityColor(activity.type)} size="sm">
                    {getActivityLabel(activity.type)}
                  </Badge>
                </HStack>
                
                <Text fontSize="xs" color={mutedColor} mb="2px">
                  {activity.description}
                  {activity.quantity && ` (${activity.quantity} unités)`}
                </Text>
                
                <HStack justify="space-between">
                  <Text fontSize="xs" color={mutedColor}>
                    Par {activity.user}
                  </Text>
                  <Text fontSize="xs" color={mutedColor}>
                    {activity.timestamp}
                  </Text>
                </HStack>
              </Box>
            </HStack>
            
            {index < displayActivities.length - 1 && (
              <Divider mt="15px" borderColor={borderColor} />
            )}
          </Box>
        ))}
      </VStack>
      
      {displayActivities.length === 0 && (
        <Text fontSize="sm" color={mutedColor} textAlign="center" py="20px">
          Aucune activité récente
        </Text>
      )}
    </Card>
  )
}
