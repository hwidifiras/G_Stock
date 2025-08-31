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
  InputGroup,
  InputLeftElement,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  useDisclosure,
  Flex,
  Icon,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react'
import { 
  MdAdd, 
  MdSearch, 
  MdFilterList,
  MdEdit,
  MdDelete,
  MdArrowUpward,
  MdArrowDownward,
  MdInventory,
  MdTrendingUp,
  MdTrendingDown,
  MdSwapHoriz
} from 'react-icons/md'
import { useState } from 'react'
import Card from '../components/Card'
import MiniStatistics from '../components/MiniStatistics'
import StockMovementForm from '../components/StockMovementForm'
import { 
  useMovements, 
  useMovementAnalytics, 
  useDeleteMovement,
  type StockMovement,
  type MovementFilters 
} from '../hooks/useStockMovements'

export default function StockMovements() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterPeriod, setFilterPeriod] = useState('all')
  const [selectedMovement, setSelectedMovement] = useState<any>(undefined)

  const cardBg = useColorModeValue("white", "navy.700")
  const textColor = useColorModeValue("secondaryGray.900", "white")
  const borderColor = useColorModeValue("gray.200", "navy.600")
  const iconBoxBg = useColorModeValue("brand.500", "brand.400")
  const mutedTextColor = useColorModeValue("secondaryGray.600", "secondaryGray.400")
  const searchIconColor = useColorModeValue("secondaryGray.500", "secondaryGray.400")

  // Build filters for API
  const filters: MovementFilters = {
    page: 1,
    limit: 20,
    ...(filterType !== 'all' && { type: filterType }),
    ...(searchTerm && { productId: searchTerm }) // Simplified search
  }

  // Get movements data
  const { 
    data: movementsData, 
    isLoading: movementsLoading, 
    error: movementsError 
  } = useMovements(filters)

  // Get analytics data
  const { 
    data: analyticsData, 
    isLoading: analyticsLoading, 
    error: analyticsError 
  } = useMovementAnalytics('30d')

  // Delete mutation
  const deleteMovement = useDeleteMovement()

  const handleEditMovement = (movement: any) => {
    setSelectedMovement(movement)
    onOpen()
  }

  const handleNewMovement = () => {
    setSelectedMovement(undefined)
    onOpen()
  }

  const handleDeleteMovement = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce mouvement?')) {
      deleteMovement.mutate({ id })
    }
  }

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Loading state
  if (movementsLoading || analyticsLoading) {
    return (
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
        <Flex justify="center" align="center" h="400px">
          <Spinner size="xl" color="brand.500" />
          <Text ml={4}>Chargement des mouvements de stock...</Text>
        </Flex>
      </Box>
    )
  }

  // Error state
  if (movementsError || analyticsError) {
    return (
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Erreur!</AlertTitle>
          <AlertDescription>
            Impossible de charger les données des mouvements de stock.
          </AlertDescription>
        </Alert>
      </Box>
    )
  }

  const movements = movementsData?.data?.movements || []
  const analytics = analyticsData?.data || {}

  // Calculate analytics summaries
  const totalMovements = analytics.summary?.totalMovements || 0
  const totalValue = analytics.summary?.totalValue || 0
  const entriesCount = analytics.summary?.byType?.entry?.count || 0
  const exitsCount = analytics.summary?.byType?.exit?.count || 0

  const getMovementTypeIcon = (type: string) => {
    switch (type) {
      case 'entry':
        return MdArrowUpward
      case 'exit':
        return MdArrowDownward
      case 'adjustment':
        return MdSwapHoriz
      case 'transfer':
        return MdInventory
      default:
        return MdInventory
    }
  }

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case 'entry':
        return 'green'
      case 'exit':
        return 'red'
      case 'adjustment':
        return 'blue'
      case 'transfer':
        return 'purple'
      default:
        return 'gray'
    }
  }

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'entry':
        return 'Entrée'
      case 'exit':
        return 'Sortie'
      case 'adjustment':
        return 'Ajustement'
      case 'transfer':
        return 'Transfert'
      default:
        return 'Inconnu'
    }
  }

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      {/* Statistics Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap='20px' mb='20px'>
        <MiniStatistics
          startContent={
            <Icon
              w='56px'
              h='56px'
              as={MdTrendingUp}
              color={iconBoxBg}
            />
          }
          name='Total Mouvements'
          value={totalMovements.toLocaleString()}
        />
        <MiniStatistics
          startContent={
            <Icon
              w='56px'
              h='56px'
              as={MdArrowUpward}
              color='green.500'
            />
          }
          name='Entrées'
          value={entriesCount.toLocaleString()}
        />
        <MiniStatistics
          startContent={
            <Icon
              w='56px'
              h='56px'
              as={MdArrowDownward}
              color='red.500'
            />
          }
          name='Sorties'
          value={exitsCount.toLocaleString()}
        />
        <MiniStatistics
          startContent={
            <Icon
              w='56px'
              h='56px'
              as={MdTrendingDown}
              color='purple.500'
            />
          }
          name='Valeur Total'
          value={`€${totalValue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}`}
        />
      </SimpleGrid>

      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" color={textColor}>
          Mouvements de Stock
        </Heading>
        <Button
          leftIcon={<MdAdd />}
          colorScheme="brand"
          onClick={handleNewMovement}
        >
          Nouveau Mouvement
        </Button>
      </Flex>

      {/* Statistics Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="20px" mb="20px">
        <MiniStatistics
          startContent={
            <Flex
              w="56px"
              h="56px"
              align="center"
              justify="center"
              bg="green.400"
              borderRadius="12px"
              color="white"
            >
              <Icon as={MdArrowUpward} width="28px" height="28px" />
            </Flex>
          }
          name="Entrées Aujourd'hui"
          value="75"
          growth="+15%"
        />
        
        <MiniStatistics
          startContent={
            <Flex
              w="56px"
              h="56px"
              align="center"
              justify="center"
              bg="red.400"
              borderRadius="12px"
              color="white"
            >
              <Icon as={MdArrowDownward} width="28px" height="28px" />
            </Flex>
          }
          name="Sorties Aujourd'hui"
          value="23"
          growth="-8%"
        />
        
        <MiniStatistics
          startContent={
            <Flex
              w="56px"
              h="56px"
              align="center"
              justify="center"
              bg={iconBoxBg}
              borderRadius="12px"
              color="white"
            >
              <Icon as={MdInventory} width="28px" height="28px" />
            </Flex>
          }
          name="Valeur Mouvements"
          value="€41,099"
          growth="+12%"
        />
        
        <MiniStatistics
          startContent={
            <Flex
              w="56px"
              h="56px"
              align="center"
              justify="center"
              bg="purple.400"
              borderRadius="12px"
              color="white"
            >
              <Icon as={MdInventory} width="28px" height="28px" />
            </Flex>
          }
          name="Ajustements"
          value="5"
          growth="+2%"
        />
      </SimpleGrid>

      {/* Filters and Search */}
      <Card bg={cardBg} p="20px" mb="20px" border="1px solid" borderColor={borderColor}>
        <VStack spacing="20px">
          <HStack spacing="20px" w="100%" flexWrap="wrap">
            <InputGroup maxW="300px">
              <InputLeftElement pointerEvents="none">
                <Icon as={MdSearch} color={searchIconColor} />
              </InputLeftElement>
              <Input
                placeholder="Rechercher un mouvement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            
            <Select
              placeholder="Type de mouvement"
              maxW="200px"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Tous les types</option>
              <option value="entry">Entrées</option>
              <option value="exit">Sorties</option>
              <option value="adjustment">Ajustements</option>
            </Select>
            
            <Select
              placeholder="Période"
              maxW="200px"
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
            >
              <option value="all">Toute période</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </Select>
            
            <Button leftIcon={<MdFilterList />} variant="outline">
              Filtres Avancés
            </Button>
          </HStack>
          
          <Text fontSize="sm" color={mutedTextColor}>
            {movements.length} mouvement(s) trouvé(s)
          </Text>
        </VStack>
      </Card>

      {/* Movements Table */}
      <Card bg={cardBg} p="20px" border="1px solid" borderColor={borderColor}>
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Date/Heure</Th>
                <Th>Type</Th>
                <Th>Produit</Th>
                <Th>Quantité</Th>
                <Th>Valeur</Th>
                <Th>Motif</Th>
                <Th>Utilisateur</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {movements.map((movement: StockMovement) => (
                <Tr key={movement.id}>
                  <Td>
                    <VStack align="start" spacing="1px">
                      <Text fontSize="sm" fontWeight="500">
                        {formatDate(movement.movementDate).split(' ')[0]}
                      </Text>
                      <Text fontSize="xs" color={mutedTextColor}>
                        {formatDate(movement.movementDate).split(' ')[1]}
                      </Text>
                    </VStack>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={getMovementTypeColor(movement.type)}
                      display="flex"
                      alignItems="center"
                      gap="5px"
                      w="fit-content"
                    >
                      <Icon as={getMovementTypeIcon(movement.type)} w="12px" h="12px" />
                      {getMovementTypeLabel(movement.type)}
                    </Badge>
                  </Td>
                  <Td>
                    <VStack align="start" spacing="1px">
                      <Text fontSize="sm" fontWeight="500">
                        {movement.product.name}
                      </Text>
                      <Text fontSize="xs" color={mutedTextColor}>
                        {movement.product.reference}
                      </Text>
                    </VStack>
                  </Td>
                  <Td>
                    <Text 
                      fontSize="sm" 
                      fontWeight="600"
                      color={movement.quantity > 0 ? 'green.500' : 'red.500'}
                    >
                      {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                    </Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm" fontWeight="500">
                      €{movement.totalValue.toFixed(2)}
                    </Text>
                  </Td>
                  <Td>
                    <VStack align="start" spacing="1px">
                      <Text fontSize="sm">{movement.reason}</Text>
                      {movement.reference && (
                        <Text fontSize="xs" color={mutedTextColor}>
                          Réf: {movement.reference}
                        </Text>
                      )}
                    </VStack>
                  </Td>
                  <Td>
                    <Text fontSize="sm">{movement.createdBy}</Text>
                  </Td>
                  <Td>
                    <HStack spacing="8px">
                      <IconButton
                        aria-label="Modifier"
                        icon={<MdEdit />}
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        onClick={() => handleEditMovement(movement)}
                      />
                      <IconButton
                        aria-label="Supprimer"
                        icon={<MdDelete />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDeleteMovement(movement.id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
        
        {movements.length === 0 && (
          <Box textAlign="center" py="40px">
            <Text color={mutedTextColor}>Aucun mouvement trouvé</Text>
          </Box>
        )}
      </Card>

      {/* Stock Movement Form Modal */}
      <StockMovementForm
        isOpen={isOpen}
        onClose={onClose}
        movement={selectedMovement}
      />
    </Box>
  )
}
