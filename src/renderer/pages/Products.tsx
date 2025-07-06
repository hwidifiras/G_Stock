import { Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td, HStack } from '@chakra-ui/react'

export default function Products() {
  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Produits</Heading>
        <Button colorScheme="brand">Ajouter un produit</Button>
      </HStack>

      <Box bg="white" rounded="lg" shadow="sm" overflow="hidden">
        <Table>
          <Thead>
            <Tr>
              <Th>Nom</Th>
              <Th>Référence</Th>
              <Th isNumeric>Stock</Th>
              <Th isNumeric>Prix unitaire</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td colSpan={5} textAlign="center" py={8} color="gray.500">
                Aucun produit enregistré
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </Box>
    </Box>
  )
}
