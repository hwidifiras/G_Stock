import { Box, Flex, Text, VStack, Link, useColorModeValue } from '@chakra-ui/react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import routes, { RouteItem } from '../../routes'

interface SimpleSidebarProps {
  mini?: boolean
}

export default function SimpleSidebar({ mini = false }: SimpleSidebarProps) {
  const location = useLocation()
  const sidebarBg = useColorModeValue('white', 'navy.800')
  const textColor = useColorModeValue('navy.700', 'white')
  const activeColor = useColorModeValue('brand.500', 'white')
  const activeBg = useColorModeValue('brand.50', 'navy.700')

  return (
    <Box
      w={mini ? '80px' : '250px'}
      h="100vh"
      bg={sidebarBg}
      boxShadow="14px 17px 40px 4px rgba(112, 144, 176, 0.08)"
      borderRadius="0 30px 30px 0"
      p={4}
      transition="all 0.3s ease"
      position="fixed"
      left={0}
      top={0}
      zIndex={100}
    >
      <Flex direction="column" height="100%">
        {/* Brand */}
        <Box mb={6} px={2}>
          <Text
            fontSize={mini ? "sm" : "xl"}
            fontWeight="bold"
            color={textColor}
            textAlign={mini ? "center" : "left"}
          >
            {mini ? "SE" : "StockEase"}
          </Text>
        </Box>

        {/* Navigation Links */}
        <VStack align="stretch" spacing={2} flex={1}>
          {routes.map((route: RouteItem) => (
            <Link
              key={route.path}
              as={RouterLink}
              to={route.path}
              p={3}
              rounded="md"
              bg={location.pathname === route.path ? activeBg : 'transparent'}
              color={location.pathname === route.path ? activeColor : textColor}
              _hover={{
                bg: activeBg,
                color: activeColor,
              }}
              transition="all 0.2s ease"
              textAlign={mini ? "center" : "left"}
              fontSize={mini ? "xs" : "sm"}
            >
              {mini ? route.name.charAt(0) : route.name}
            </Link>
          ))}
        </VStack>
      </Flex>
    </Box>
  )
}
