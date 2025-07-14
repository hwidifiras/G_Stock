import { Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td, HStack, useDisclosure, Badge, useColorModeValue } from '@chakra-ui/react'
import { useState } from 'react'
import Card from '../components/Card'
import ProductForm from '../components/ProductForm'

interface Product {
  id: string
  name: string
  reference: string
  stock: number
  price: number
  description?: string
}

export default function Products() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | undefined>()

  const handleAddProduct = () => {
    setEditingProduct(undefined)
    onOpen()
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    onOpen()
  }

  const handleSaveProduct = (productData: Omit<Product, 'id'> & { id?: string }) => {
    if (productData.id) {
      // Edit existing product
      setProducts(prev => prev.map(p => 
        p.id === productData.id ? { ...productData, id: productData.id } as Product : p
      ))
    } else {
      // Add new product
      const newProduct: Product = {
        ...productData,
        id: Date.now().toString(), // Simple ID generation
      }
      setProducts(prev => [...prev, newProduct])
    }
  }

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  const getStockBadge = (stock: number) => {
    if (stock === 0) return <Badge colorScheme="red">Rupture</Badge>
    if (stock < 10) return <Badge colorScheme="orange">Faible</Badge>
    return <Badge colorScheme="green">En stock</Badge>
  }

  const cardBg = useColorModeValue('white', 'navy.700');
  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Produits</Heading>
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
              <Th>Statut</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {products.length === 0 ? (
              <Tr>
                <Td colSpan={6} textAlign="center" py={8} color="gray.500">
                  Aucun produit enregistré
                </Td>
              </Tr>
            ) : (
              products.map((product) => (
                <Tr key={product.id}>
                  <Td fontWeight="medium">{product.name}</Td>
                  <Td>{product.reference}</Td>
                  <Td isNumeric>{product.stock}</Td>
                  <Td isNumeric>{product.price.toFixed(2)} €</Td>
                  <Td>{getStockBadge(product.stock)}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        onClick={() => handleEditProduct(product)}
                      >
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDeleteProduct(product.id)}
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
        onClose={onClose}
        onSave={handleSaveProduct}
        product={editingProduct}
      />
    </Box>
  )
}
