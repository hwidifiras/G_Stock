import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Text,
  Flex
} from '@chakra-ui/react'
import { ReactNode } from 'react'
import Card from './Card'

interface StatisticData {
  label: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
  }
  helpText?: string
  icon?: ReactNode
  colorScheme?: 'green' | 'red' | 'blue' | 'orange' | 'purple'
}

interface StatisticsSummaryProps {
  title?: string
  data: StatisticData[]
  columns?: { base: number; md: number; lg: number }
}

export default function StatisticsSummary({ 
  title = "Résumé Statistiques", 
  data, 
  columns = { base: 1, md: 2, lg: 4 } 
}: StatisticsSummaryProps) {
  const cardBg = useColorModeValue("white", "navy.700")
  const textColor = useColorModeValue("secondaryGray.900", "white")
  const borderColor = useColorModeValue("gray.200", "navy.600")

  const getStatColor = (colorScheme?: string) => {
    switch (colorScheme) {
      case 'green':
        return 'green.500'
      case 'red':
        return 'red.500'
      case 'blue':
        return 'blue.500'
      case 'orange':
        return 'orange.500'
      case 'purple':
        return 'purple.500'
      default:
        return 'brand.500'
    }
  }

  return (
    <Box>
      {title && (
        <Text fontSize="lg" fontWeight="bold" mb="20px" color={textColor}>
          {title}
        </Text>
      )}
      
      <SimpleGrid columns={columns} spacing="20px">
        {data.map((stat, index) => (
          <Card key={index} bg={cardBg} p="20px" border="1px solid" borderColor={borderColor}>
            <Stat>
              <Flex align="center" justify="space-between" mb="10px">
                <StatLabel color="secondaryGray.600" fontSize="sm" fontWeight="500">
                  {stat.label}
                </StatLabel>
                {stat.icon && (
                  <Flex
                    w="40px"
                    h="40px"
                    align="center"
                    justify="center"
                    bg={getStatColor(stat.colorScheme)}
                    borderRadius="8px"
                    color="white"
                  >
                    {stat.icon}
                  </Flex>
                )}
              </Flex>
              
              <StatNumber 
                color={textColor} 
                fontSize="2xl" 
                fontWeight="bold"
                mb="5px"
              >
                {stat.value}
              </StatNumber>
              
              {stat.change && (
                <StatHelpText mb="0">
                  <StatArrow type={stat.change.type} />
                  {Math.abs(stat.change.value)}%
                  {stat.helpText && (
                    <Text as="span" color="secondaryGray.600" ml="5px">
                      {stat.helpText}
                    </Text>
                  )}
                </StatHelpText>
              )}
              
              {!stat.change && stat.helpText && (
                <StatHelpText color="secondaryGray.600" mb="0">
                  {stat.helpText}
                </StatHelpText>
              )}
            </Stat>
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  )
}
