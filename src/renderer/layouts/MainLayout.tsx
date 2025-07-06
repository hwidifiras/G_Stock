import { Box, Flex, Link, Spacer, Text, VStack } from '@chakra-ui/react'
import { Link as RouterLink, useLocation } from 'react-router-dom'

const menuItems = [
  { path: '/', label: 'Tableau de bord' },
  { path: '/products', label: 'Produits' },
]

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  return (
    <Flex h="100vh">
      {/* Sidebar */}
      <Box w="250px" bg="white" boxShadow="sm" p={4}>
        <Text fontSize="xl" fontWeight="bold" mb={6}>StockEase</Text>
        <VStack align="stretch" spacing={2}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              as={RouterLink}
              to={item.path}
              p={3}
              rounded="md"
              bg={location.pathname === item.path ? 'brand.50' : 'transparent'}
              color={location.pathname === item.path ? 'brand.500' : 'gray.600'}
              _hover={{
                bg: 'gray.50',
                color: 'brand.500',
              }}
            >
              {item.label}
            </Link>
          ))}
        </VStack>
      </Box>

      {/* Main content */}
      <Box flex={1} bg="gray.50" p={8} overflowY="auto">
        {children}
      </Box>
    </Flex>
  )
}
