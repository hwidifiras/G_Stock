import {
  Button,
  SimpleGrid,
  Text,
  useColorModeValue,
  VStack,
  Icon
} from '@chakra-ui/react'
import { 
  MdAdd, 
  MdInventory, 
  MdAssessment, 
  MdSettings,
  MdFileDownload,
  MdNotifications
} from 'react-icons/md'
import Card from './Card'

interface QuickAction {
  label: string
  description: string
  icon: any
  colorScheme: string
  onClick: () => void
}

interface DashboardActionsProps {
  onNavigate: (path: string) => void
}

export default function DashboardActions({ onNavigate }: DashboardActionsProps) {
  const cardBg = useColorModeValue("white", "navy.700")
  const textColor = useColorModeValue("secondaryGray.900", "white")
  const borderColor = useColorModeValue("gray.200", "navy.600")

  const quickActions: QuickAction[] = [
    {
      label: "Ajouter Produit",
      description: "Nouveau produit au stock",
      icon: MdAdd,
      colorScheme: "brand",
      onClick: () => onNavigate('/products')
    },
    {
      label: "Gérer Stock", 
      description: "Mouvements et inventaire",
      icon: MdInventory,
      colorScheme: "green",
      onClick: () => onNavigate('/stock-movements')
    },
    {
      label: "Rapports",
      description: "Analytics et exports",
      icon: MdAssessment,
      colorScheme: "blue", 
      onClick: () => onNavigate('/reports')
    },
    {
      label: "Exporter",
      description: "Télécharger données",
      icon: MdFileDownload,
      colorScheme: "purple",
      onClick: () => console.log('Export triggered')
    },
    {
      label: "Alertes",
      description: "Stocks faibles",
      icon: MdNotifications,
      colorScheme: "orange",
      onClick: () => console.log('Alerts shown')
    },
    {
      label: "Paramètres",
      description: "Configuration app",
      icon: MdSettings,
      colorScheme: "gray",
      onClick: () => onNavigate('/settings')
    }
  ]

  const getButtonColorScheme = (scheme: string) => {
    switch (scheme) {
      case 'brand': return 'brand'
      case 'green': return 'green'
      case 'blue': return 'blue'
      case 'purple': return 'purple'
      case 'orange': return 'orange'
      default: return 'gray'
    }
  }

  return (
    <Card bg={cardBg} p="20px" border="1px solid" borderColor={borderColor}>
      <Text fontSize="lg" fontWeight="bold" mb="20px" color={textColor}>
        Actions Rapides
      </Text>
      
      <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing="15px">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            h="80px"
            p="15px"
            variant="outline"
            colorScheme={getButtonColorScheme(action.colorScheme)}
            onClick={action.onClick}
            _hover={{
              transform: 'translateY(-2px)',
              shadow: 'lg'
            }}
            transition="all 0.2s"
          >
            <VStack spacing="8px">
              <Icon as={action.icon} w="24px" h="24px" />
              <VStack spacing="2px">
                <Text fontSize="xs" fontWeight="600" textAlign="center">
                  {action.label}
                </Text>
                <Text fontSize="xx-small" opacity="0.8" textAlign="center">
                  {action.description}
                </Text>
              </VStack>
            </VStack>
          </Button>
        ))}
      </SimpleGrid>
    </Card>
  )
}
