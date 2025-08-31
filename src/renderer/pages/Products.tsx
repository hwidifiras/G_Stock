import { Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td, HStack, useDisclosure, Badge, useColorModeValue, Spinner, Alert, AlertIcon, AlertTitle, AlertDescription, Text, Flex } from '@chakra-ui/react'
import { useState } from 'react'
import Card from '../components/Card'
import ProductForm from '../components/ProductForm'
import { useProducts, useDeleteProduct } from '../hooks/useProducts'
import { Product } from '../services/api'

export default function Products() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [editingProduct, setEditingProduct] = useState<Product | undefined>()

  // Fetch products using React Query
  const { data: productsResponse, isLoading, error, refetch } = useProducts()
  const deleteProductMutation = useDeleteProduct()

  const products = productsResponse?.data || []

  const handleAddProduct = () => {
    setEditingProduct(undefined)
    onOpen()
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    onOpen()
  }

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      deleteProductMutation.mutate(id)
    }
  }

  const handleFormClose = () => {
    setEditingProduct(undefined)
    onClose()
  }

  const getStockBadge = (product: Product) => {
    const quantity = product.quantity
    const stockStatus = product.stockStatus

    if (stockStatus === 'out-of-stock' || quantity === 0) {
      return <Badge colorScheme="red">Rupture</Badge>
    }
    if (stockStatus === 'low-stock') {
      return <Badge colorScheme="orange">Faible</Badge>
    }
    return <Badge colorScheme="green">En stock</Badge>
  }

  const cardBg = useColorModeValue('white', 'navy.700')
  const textColor = useColorModeValue('gray.700', 'white')

  // Loading state
  if (isLoading) {
    return (
      <Box>
        <Heading size="lg" mb={6} color={textColor}>Produits</Heading>
        <Flex justify="center" align="center" minH="300px">
          <Spinner size="xl" color="brand.500" />
        </Flex>
      </Box>
    )
  }

  // Error state
  if (error) {
    return (
      <Box>
        <Heading size="lg" mb={6} color={textColor}>Produits</Heading>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Erreur de connexion!</AlertTitle>
          <AlertDescription>
            Impossible de charger les produits. Vérifiez que le serveur backend est démarré.
            <Button ml={4} size="sm" onClick={() => refetch()}>
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      </Box>
    )
  }

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg" color={textColor}>Produits</Heading>
        <Button colorScheme="brand" onClick={handleAddProduct}>
          Ajouter un produit
        </Button>
      </HStack>

      <Card bg={cardBg} rounded="lg" shadow="sm" overflow="hidden">
        <Table>
          <Thead>
            <Tr>
              <Th>Nom</Th>
              <Th>Référence</Th>
              <Th isNumeric>Stock</Th>
              <Th isNumeric>Prix unitaire</Th>
              <Th>Catégorie</Th>
              <Th>Statut</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {products.length === 0 ? (
              <Tr>
                <Td colSpan={7} textAlign="center" py={8} color="gray.500">
                  Aucun produit enregistré
                </Td>
              </Tr>
            ) : (
              products.map((product) => (
                <Tr key={product._id}>
                  <Td fontWeight="medium" color={textColor}>{product.name}</Td>
                  <Td color={textColor}>{product.reference}</Td>
                  <Td isNumeric color={textColor}>{product.quantity}</Td>
                  <Td isNumeric color={textColor}>{product.price.toFixed(2)} €</Td>
                  <Td color={textColor}>{product.category || 'N/A'}</Td>
                  <Td>{getStockBadge(product)}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        onClick={() => handleEditProduct(product)}
                        isLoading={deleteProductMutation.isPending}
                      >
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDeleteProduct(product._id)}
                        isLoading={deleteProductMutation.isPending}
                      >
                        Supprimer
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Card>

      <ProductForm
        isOpen={isOpen}
        onClose={handleFormClose}
        product={editingProduct}
      />
    </Box>
  )
}
