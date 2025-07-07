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
  Icon
} from '@chakra-ui/react'
import { 
  MdAdd, 
  MdSearch, 
  MdFilterList,
  MdEdit,
  MdDelete,
  MdArrowUpward,
  MdArrowDownward,
  MdInventory
} from 'react-icons/md'
import { useState } from 'react'
import Card from '../components/Card'
import MiniStatistics from '../components/MiniStatistics'
import StockMovementForm from '../components/StockMovementForm'

interface StockMovement {
  id: string
  date: string
  type: 'entry' | 'exit' | 'adjustment'
  product: string
  productId: string
  quantity: number
  unitPrice?: number
  totalValue: number
  reason: string
  user: string
  reference?: string
}

export default function StockMovements() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterPeriod, setFilterPeriod] = useState('all')
  const [selectedMovement, setSelectedMovement] = useState<StockMovement | undefined>(undefined)

  const cardBg = useColorModeValue("white", "navy.700")
  const textColor = useColorModeValue("secondaryGray.900", "white")
  const borderColor = useColorModeValue("gray.200", "navy.600")
  const iconBoxBg = useColorModeValue("brand.500", "brand.400")

  const handleSaveMovement = (movement: any) => {
    console.log('Saving movement:', movement)
    // Here you would typically save to your backend/database
  }

  const handleEditMovement = (movement: StockMovement) => {
    setSelectedMovement(movement)
    onOpen()
  }

  const handleNewMovement = () => {
    setSelectedMovement(undefined)
    onOpen()
  }

  // Mock data for stock movements
  const mockMovements: StockMovement[] = [
    {
      id: '1',
      date: '2024-12-07 10:30',
      type: 'entry',
      product: 'iPhone 14 Pro',
      productId: 'PROD001',
      quantity: 25,
      unitPrice: 999.99,
      totalValue: 24999.75,
      reason: 'Réapprovisionnement fournisseur',
      user: 'Admin',
      reference: 'PO-2024-001'
    },
    {
      id: '2',
      date: '2024-12-07 09:15',
      type: 'exit',
      product: 'Samsung Galaxy S23',
      productId: 'PROD002',
      quantity: 3,
      unitPrice: 799.99,
      totalValue: 2399.97,
      reason: 'Vente client',
      user: 'Vendeur1',
      reference: 'SO-2024-045'
    },
    {
      id: '3',
      date: '2024-12-06 16:45',
      type: 'adjustment',
      product: 'MacBook Air M2',
      productId: 'PROD003',
      quantity: -2,
      totalValue: 0,
      reason: 'Correction inventaire',
      user: 'Admin'
    },
    {
      id: '4',
      date: '2024-12-06 14:20',
      type: 'entry',
      product: 'AirPods Pro 2',
      productId: 'PROD004',
      quantity: 50,
      unitPrice: 249.99,
      totalValue: 12499.50,
      reason: 'Nouvelle commande',
      user: 'Admin',
      reference: 'PO-2024-002'
    },
    {
      id: '5',
      date: '2024-12-06 11:30',
      type: 'exit',
      product: 'iPad Pro 12.9"',
      productId: 'PROD005',
      quantity: 1,
      unitPrice: 1199.99,
      totalValue: 1199.99,
      reason: 'Vente en ligne',
      user: 'Vendeur2',
      reference: 'SO-2024-046'
    }
  ]

  const getMovementTypeIcon = (type: string) => {
    switch (type) {
      case 'entry':
        return MdArrowUpward
      case 'exit':
        return MdArrowDownward
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
      default:
        return 'blue'
    }
  }

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'entry':
        return 'Entrée'
      case 'exit':
        return 'Sortie'
      default:
        return 'Ajustement'
    }
  }

  const filteredMovements = mockMovements.filter(movement => {
    const matchesSearch = movement.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.reference?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || movement.type === filterType
    return matchesSearch && matchesType
  })

  return (
    <Box>
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
                <Icon as={MdSearch} color="gray.300" />
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
          
          <Text fontSize="sm" color="gray.500">
            {filteredMovements.length} mouvement(s) trouvé(s)
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
              {filteredMovements.map((movement) => (
                <Tr key={movement.id}>
                  <Td>
                    <VStack align="start" spacing="1px">
                      <Text fontSize="sm" fontWeight="500">
                        {movement.date.split(' ')[0]}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {movement.date.split(' ')[1]}
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
                        {movement.product}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {movement.productId}
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
                        <Text fontSize="xs" color="gray.500">
                          Réf: {movement.reference}
                        </Text>
                      )}
                    </VStack>
                  </Td>
                  <Td>
                    <Text fontSize="sm">{movement.user}</Text>
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
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
        
        {filteredMovements.length === 0 && (
          <Box textAlign="center" py="40px">
            <Text color="gray.500">Aucun mouvement trouvé</Text>
          </Box>
        )}
      </Card>

      {/* Stock Movement Form Modal */}
      <StockMovementForm
        isOpen={isOpen}
        onClose={onClose}
        onSave={handleSaveMovement}
        movement={selectedMovement}
      />
    </Box>
  )
}
