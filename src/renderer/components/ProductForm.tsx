import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  useColorModeValue,
  Textarea,
  Text,
  Divider,
  SimpleGrid
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useCreateProduct, useUpdateProduct } from '../hooks/useProducts'
import { Product, CreateProductData } from '../services/api'

interface ProductFormProps {
  isOpen: boolean
  onClose: () => void
  product?: Product
}

export default function ProductForm({ isOpen, onClose, product }: ProductFormProps) {
  // React Query hooks
  const createProductMutation = useCreateProduct()
  const updateProductMutation = useUpdateProduct()

  const [formData, setFormData] = useState({
    name: '',
    reference: '',
    quantity: 0,
    price: 0,
    description: '',
    category: '',
    minStock: 1,
    unit: 'pièce',
    status: 'active' as 'active' | 'inactive'
  })

  const [categories] = useState<string[]>(['Électronique', 'Informatique', 'Accessoires', 'Audio', 'Mobilier', 'Vêtements'])
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Update form data when product prop changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        reference: product.reference || '',
        quantity: product.quantity || 0,
        price: product.price || 0,
        description: product.description || '',
        category: product.category || '',
        minStock: product.minStock || 1,
        unit: product.unit || 'pièce',
        status: product.status || 'active'
      })
    } else {
      // Reset form for new product
      setFormData({
        name: '',
        reference: '',
        quantity: 0,
        price: 0,
        description: '',
        category: '',
        minStock: 1,
        unit: 'pièce',
        status: 'active'
      })
    }
    setErrors({})
  }, [product, isOpen])

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    let value: any = e.target.value
    if (field === 'quantity' || field === 'price' || field === 'minStock') {
      value = Number(value)
    }
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!formData.name.trim()) errs.name = 'Nom requis'
    if (!formData.reference.trim()) errs.reference = 'Référence requise'
    if (!formData.category) errs.category = 'Catégorie requise'
    if (formData.price < 0) errs.price = 'Prix doit être positif'
    if (formData.quantity < 0) errs.quantity = 'Quantité doit être positive'
    if (formData.minStock < 0) errs.minStock = 'Seuil minimal doit être positif'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    const productData: CreateProductData = {
      name: formData.name,
      reference: formData.reference,
      quantity: formData.quantity,
      price: formData.price,
      description: formData.description,
      category: formData.category,
      minStock: formData.minStock,
      unit: formData.unit,
      status: formData.status
    }

    try {
      if (product) {
        // Update existing product
        await updateProductMutation.mutateAsync({
          id: product._id,
          data: productData
        })
      } else {
        // Create new product
        await createProductMutation.mutateAsync(productData)
      }
      onClose()
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error('Form submission error:', error)
    }
  }

  const isLoading = createProductMutation.isPending || updateProductMutation.isPending

  // Style tokens
  const modalBg = useColorModeValue('white', 'navy.800')
  const sectionTitleColor = useColorModeValue('gray.700', 'gray.200')
  const dividerColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered closeOnOverlayClick={!isLoading}>
      <ModalOverlay />
      <ModalContent bg={modalBg} borderRadius="2xl" boxShadow="2xl" p={1} maxW="900px" w="100%">
        <ModalHeader fontWeight="bold" fontSize="2xl" letterSpacing="tight" color={sectionTitleColor}>
          {product ? 'Modifier le produit' : 'Ajouter un produit'}
        </ModalHeader>
        <ModalCloseButton isDisabled={isLoading} />
        
        <ModalBody px={{ base: 2, md: 6 }} py={2}>
          <VStack spacing={6} align="stretch" w="100%">
            <Text fontWeight="bold" color={sectionTitleColor} fontSize="md">
              Informations du produit
            </Text>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isInvalid={!!errors.name}>
                <FormLabel fontWeight="semibold">Nom du produit *</FormLabel>
                <Input
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  placeholder="Nom du produit"
                  borderRadius="lg"
                  disabled={isLoading}
                />
                {errors.name && <Text color="red.500" fontSize="sm">{errors.name}</Text>}
              </FormControl>

              <FormControl isInvalid={!!errors.reference}>
                <FormLabel fontWeight="semibold">Référence *</FormLabel>
                <Input
                  value={formData.reference}
                  onChange={handleInputChange('reference')}
                  placeholder="REF001"
                  borderRadius="lg"
                  disabled={isLoading}
                />
                {errors.reference && <Text color="red.500" fontSize="sm">{errors.reference}</Text>}
              </FormControl>

              <FormControl isInvalid={!!errors.category}>
                <FormLabel fontWeight="semibold">Catégorie *</FormLabel>
                <Select
                  value={formData.category}
                  onChange={handleInputChange('category')}
                  placeholder="Sélectionner une catégorie"
                  borderRadius="lg"
                  disabled={isLoading}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Select>
                {errors.category && <Text color="red.500" fontSize="sm">{errors.category}</Text>}
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="semibold">Unité</FormLabel>
                <Select
                  value={formData.unit}
                  onChange={handleInputChange('unit')}
                  borderRadius="lg"
                  disabled={isLoading}
                >
                  <option value="pièce">Pièce</option>
                  <option value="kg">Kilogramme</option>
                  <option value="litre">Litre</option>
                  <option value="mètre">Mètre</option>
                  <option value="pack">Pack</option>
                  <option value="boîte">Boîte</option>
                </Select>
              </FormControl>

              <FormControl isInvalid={!!errors.quantity}>
                <FormLabel fontWeight="semibold">Quantité en stock *</FormLabel>
                <Input
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={handleInputChange('quantity')}
                  placeholder="0"
                  borderRadius="lg"
                  disabled={isLoading}
                />
                {errors.quantity && <Text color="red.500" fontSize="sm">{errors.quantity}</Text>}
              </FormControl>

              <FormControl isInvalid={!!errors.minStock}>
                <FormLabel fontWeight="semibold">Seuil minimal *</FormLabel>
                <Input
                  type="number"
                  min="0"
                  value={formData.minStock}
                  onChange={handleInputChange('minStock')}
                  placeholder="1"
                  borderRadius="lg"
                  disabled={isLoading}
                />
                {errors.minStock && <Text color="red.500" fontSize="sm">{errors.minStock}</Text>}
              </FormControl>

              <FormControl isInvalid={!!errors.price}>
                <FormLabel fontWeight="semibold">Prix unitaire (€) *</FormLabel>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange('price')}
                  placeholder="0.00"
                  borderRadius="lg"
                  disabled={isLoading}
                />
                {errors.price && <Text color="red.500" fontSize="sm">{errors.price}</Text>}
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="semibold">Statut</FormLabel>
                <Select
                  value={formData.status}
                  onChange={handleInputChange('status')}
                  borderRadius="lg"
                  disabled={isLoading}
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </Select>
              </FormControl>
            </SimpleGrid>

            <Divider borderColor={dividerColor} />

            <FormControl>
              <FormLabel fontWeight="semibold">Description</FormLabel>
              <Textarea
                value={formData.description}
                onChange={handleInputChange('description')}
                placeholder="Description du produit..."
                rows={3}
                borderRadius="lg"
                disabled={isLoading}
              />
            </FormControl>
          </VStack>
        </ModalBody>
        
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isLoading}>
            Annuler
          </Button>
          <Button 
            colorScheme="brand" 
            onClick={handleSubmit} 
            isLoading={isLoading}
            loadingText={product ? 'Modification...' : 'Création...'}
          >
            {product ? 'Modifier' : 'Ajouter'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
