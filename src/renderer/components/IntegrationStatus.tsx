/**
 * Integration Status Component
 * Shows the current status of frontend-backend integration
 */

import {
  Box,
  HStack,
  VStack,
  Text,
  Progress,
  Badge,
  Icon,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react'
import { FiCheck, FiAlertTriangle, FiLoader, FiX } from 'react-icons/fi'
import { useIntegrationStatus } from '../hooks/useIntegrationStatus'

interface IntegrationStatusProps {
  compact?: boolean
  showDetails?: boolean
}

export const IntegrationStatus: React.FC<IntegrationStatusProps> = ({ 
  compact = false, 
  showDetails = true 
}) => {
  const integration = useIntegrationStatus()
  
  const bgColor = useColorModeValue('white', 'navy.700')
  const borderColor = useColorModeValue('gray.200', 'navy.600')
  const textColor = useColorModeValue('secondaryGray.900', 'white')
  const mutedTextColor = useColorModeValue('secondaryGray.600', 'secondaryGray.400')

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return FiCheck
      case 'failed':
        return FiX
      case 'loading':
        return FiLoader
      default:
        return FiAlertTriangle
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green'
      case 'failed':
        return 'red'
      case 'loading':
        return 'blue'
      default:
        return 'orange'
    }
  }

  if (compact) {
    return (
      <Tooltip label={integration.summary} hasArrow>
        <HStack spacing="2">
          <Icon 
            as={getStatusIcon(integration.overall)} 
            color={`${getStatusColor(integration.overall)}.500`}
          />
          <Text fontSize="sm" color={textColor}>
            {integration.overallProgress}%
          </Text>
          <Badge colorScheme={getStatusColor(integration.overall)} variant="subtle" size="sm">
            {integration.overall}
          </Badge>
        </HStack>
      </Tooltip>
    )
  }

  return (
    <Box
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="lg"
      p="4"
    >
      <VStack align="stretch" spacing="3">
        <HStack justify="space-between">
          <Text fontSize="md" fontWeight="semibold" color={textColor}>
            Integration Status
          </Text>
          <Badge colorScheme={getStatusColor(integration.overall)} variant="subtle">
            {integration.overallProgress}% Complete
          </Badge>
        </HStack>

        <Progress
          value={integration.overallProgress}
          colorScheme={getStatusColor(integration.overall)}
          borderRadius="md"
          size="md"
        />

        <Text fontSize="sm" color={mutedTextColor}>
          {integration.summary}
        </Text>

        {showDetails && (
          <VStack align="stretch" spacing="2" mt="2">
            {integration.modules.map((module, index) => (
              <HStack key={index} justify="space-between">
                <HStack spacing="2">
                  <Icon 
                    as={getStatusIcon(module.status)} 
                    color={`${getStatusColor(module.status)}.500`}
                    boxSize="4"
                  />
                  <Text fontSize="sm" color={textColor}>
                    {module.name}
                  </Text>
                </HStack>
                
                <HStack spacing="2">
                  <Text fontSize="xs" color={mutedTextColor}>
                    {module.progress}%
                  </Text>
                  <Badge 
                    colorScheme={getStatusColor(module.status)} 
                    variant="outline" 
                    size="sm"
                  >
                    {module.hasData ? 'Data ✓' : 'No Data'}
                  </Badge>
                </HStack>
              </HStack>
            ))}
          </VStack>
        )}
      </VStack>
    </Box>
  )
}

export default IntegrationStatus
