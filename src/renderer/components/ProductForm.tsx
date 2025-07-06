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
  HStack,
} from '@chakra-ui/react'
import { useState } from 'react'
import InputField from '../components/InputField'
import TextField from '../components/TextField'

interface Product {
  id?: string
  name: string
  reference: string
  stock: number
  price: number
  description?: string
}

interface ProductFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (product: Product) => void
  product?: Product
}

export default function ProductForm({ isOpen, onClose, onSave, product }: ProductFormProps) {
  const [formData, setFormData] = useState<Product>({
    name: product?.name || '',
    reference: product?.reference || '',
    stock: product?.stock || 0,
    price: product?.price || 0,
    description: product?.description || '',
  })

  const handleInputChange = (field: keyof Product) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = field === 'stock' || field === 'price' ? Number(e.target.value) : e.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (formData.name && formData.reference) {
      onSave({ ...formData, id: product?.id })
      onClose()
      setFormData({
        name: '',
        reference: '',
        stock: 0,
        price: 0,
        description: '',
      })
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{product ? 'Modifier le produit' : 'Ajouter un produit'}</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4}>
            <InputField
              label="Nom du produit"
              placeholder="Entrez le nom du produit"
              value={formData.name}
              onChange={handleInputChange('name')}
              isRequired
            />
            
            <InputField
              label="Référence"
              placeholder="Entrez la référence"
              value={formData.reference}
              onChange={handleInputChange('reference')}
              isRequired
            />
            
            <HStack spacing={4} w="100%">
              <InputField
                label="Stock"
                type="number"
                placeholder="0"
                value={formData.stock.toString()}
                onChange={handleInputChange('stock')}
                min={0}
              />
              
              <InputField
                label="Prix unitaire (€)"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.price.toString()}
                onChange={handleInputChange('price')}
                min={0}
              />
            </HStack>
            
            <TextField
              label="Description"
              placeholder="Description du produit (optionnel)"
              value={formData.description}
              onChange={handleInputChange('description')}
              h="100px"
              maxH="100px"
            />
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Annuler
          </Button>
          <Button 
            colorScheme="brand" 
            onClick={handleSubmit}
            isDisabled={!formData.name || !formData.reference}
          >
            {product ? 'Modifier' : 'Ajouter'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
