import { Box, Flex, useColorModeValue } from '@chakra-ui/react'
import { useLocation } from 'react-router-dom'
import { useState } from 'react'
import SimpleSidebar from '../components/SimpleSidebar'
import SimpleNavbar from '../components/SimpleNavbar'

const getPageTitle = (pathname: string): string => {
  switch (pathname) {
    case '/':
      return 'Tableau de bord'
    case '/products':
      return 'Produits'
    default:
      return 'Dashboard'
  }
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [mini, setMini] = useState(false)
  const pageTitle = getPageTitle(location.pathname)

  const mainBg = useColorModeValue('gray.50', 'navy.800');
  return (
    <Flex h="100vh" bg={mainBg}>
      {/* Sidebar */}
      <SimpleSidebar mini={mini} />

      {/* Navbar */}
      <SimpleNavbar 
        brandText={pageTitle}
        onToggleSidebar={() => setMini(!mini)}
        mini={mini}
      />

      {/* Main content */}
      <Box 
        flex={1} 
        ml={mini ? "80px" : "250px"}
        mt="70px"
        p={8} 
        overflowY="auto"
        transition="margin-left 0.3s ease"
      >
        {children}
      </Box>
    </Flex>
  )
}
