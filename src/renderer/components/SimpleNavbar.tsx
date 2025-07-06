import { Box, Flex, Text, Spacer, Button, useColorModeValue } from '@chakra-ui/react'

interface SimpleNavbarProps {
  brandText?: string
  onToggleSidebar?: () => void
  mini?: boolean
}

export default function SimpleNavbar({ 
  brandText = "Dashboard", 
  onToggleSidebar,
  mini = false 
}: SimpleNavbarProps) {
  const navbarBg = useColorModeValue('rgba(244, 247, 254, 0.2)', 'rgba(11,20,55,0.5)')
  const textColor = useColorModeValue('navy.700', 'white')
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.300')

  return (
    <Box
      position="fixed"
      top={0}
      left={mini ? "80px" : "250px"}
      right={0}
      zIndex={10}
      transition="left 0.3s ease"
    >
      <Flex
        bg={navbarBg}
        backdropFilter="blur(20px)"
        borderBottom="1px solid"
        borderColor={borderColor}
        px={6}
        py={4}
        align="center"
        h="70px"
      >
        {/* Breadcrumb */}
        <Box>
          <Text fontSize="sm" color="gray.500" mb={1}>
            Pages
          </Text>
          <Text fontSize="lg" fontWeight="bold" color={textColor}>
            {brandText}
          </Text>
        </Box>

        <Spacer />

        {/* Navbar actions */}
        <Flex align="center" gap={4}>
          {onToggleSidebar && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              display={{ base: 'flex', xl: 'none' }}
            >
              ☰
            </Button>
          )}
        </Flex>
      </Flex>
    </Box>
  )
}
