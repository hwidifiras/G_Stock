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
  Select,
  Textarea,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'

interface StockMovement {
  id?: string
  type: 'entry' | 'exit' | 'adjustment'
  productId: string
  quantity: number
  unitPrice?: number
  reason: string
  reference?: string
}

interface StockMovementFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (movement: StockMovement) => void
  movement?: StockMovement
}

export default function StockMovementForm({ 
  isOpen, 
  onClose, 
  onSave, 
  movement 
}: StockMovementFormProps) {
  const toast = useToast()
  const [formData, setFormData] = useState<StockMovement>({
    type: 'entry',
    productId: '',
    quantity: 0,
    unitPrice: 0,
    reason: '',
    reference: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Mock products for dropdown
  const mockProducts = [
    { id: 'PROD001', name: 'iPhone 14 Pro', currentStock: 15 },
    { id: 'PROD002', name: 'Samsung Galaxy S23', currentStock: 8 },
    { id: 'PROD003', name: 'MacBook Air M2', currentStock: 5 },
    { id: 'PROD004', name: 'AirPods Pro 2', currentStock: 32 },
    { id: 'PROD005', name: 'iPad Pro 12.9"', currentStock: 12 }
  ]

  useEffect(() => {
    if (movement) {
      setFormData(movement)
    } else {
      setFormData({
        type: 'entry',
        productId: '',
        quantity: 0,
        unitPrice: 0,
        reason: '',
        reference: ''
      })
    }
    setErrors({})
  }, [movement, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.productId) {
      newErrors.productId = 'Veuillez sélectionner un produit'
    }

    if (formData.quantity === 0) {
      newErrors.quantity = 'La quantité ne peut pas être 0'
    }

    if (formData.type === 'exit') {
      const product = mockProducts.find(p => p.id === formData.productId)
      if (product && Math.abs(formData.quantity) > product.currentStock) {
        newErrors.quantity = `Stock insuffisant (disponible: ${product.currentStock})`
      }
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Veuillez indiquer le motif'
    }

    if ((formData.type === 'entry' || formData.type === 'exit') && !formData.unitPrice) {
      newErrors.unitPrice = 'Le prix unitaire est requis'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      const movementData = {
        ...formData,
        quantity: formData.type === 'exit' ? -Math.abs(formData.quantity) : Math.abs(formData.quantity),
        unitPrice: formData.type === 'adjustment' ? 0 : formData.unitPrice
      }
      
      onSave(movementData)
      onClose()
      
      toast({
        title: 'Mouvement enregistré',
        description: `Le mouvement de stock a été ${movement ? 'modifié' : 'ajouté'} avec succès.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const getQuantityLabel = () => {
    switch (formData.type) {
      case 'entry':
        return 'Quantité à ajouter'
      case 'exit':
        return 'Quantité à retirer'
      default:
        return 'Ajustement (+/-)'
    }
  }

  const getReasonPlaceholder = () => {
    switch (formData.type) {
      case 'entry':
        return 'Ex: Réapprovisionnement fournisseur, Retour client...'
      case 'exit':
        return 'Ex: Vente, Casse, Vol, Échantillon...'
      default:
        return 'Ex: Correction inventaire, Perte, Détérioration...'
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {movement ? 'Modifier le mouvement' : 'Nouveau mouvement de stock'}
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired isInvalid={!!errors.type}>
              <FormLabel>Type de mouvement</FormLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  type: e.target.value as 'entry' | 'exit' | 'adjustment'
                }))}
                placeholder="Sélectionnez un type"
              >
                <option value="entry">Entrée - Ajout au stock</option>
                <option value="exit">Sortie - Retrait du stock</option>
                <option value="adjustment">Ajustement - Correction manuelle</option>
              </Select>
              <FormErrorMessage>{errors.type}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.productId}>
              <FormLabel>Produit</FormLabel>
              <Select
                value={formData.productId}
                onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
                placeholder="Sélectionnez un produit"
              >
                {mockProducts.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} (Stock: {product.currentStock})
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{errors.productId}</FormErrorMessage>
            </FormControl>

            <HStack spacing={4} w="100%">
              <FormControl isRequired isInvalid={!!errors.quantity}>
                <FormLabel>{getQuantityLabel()}</FormLabel>
                <NumberInput
                  value={formData.quantity}
                  onChange={(_, valueAsNumber) => setFormData(prev => ({ 
                    ...prev, 
                    quantity: isNaN(valueAsNumber) ? 0 : valueAsNumber 
                  }))}
                  min={formData.type === 'adjustment' ? undefined : 1}
                >
                  <NumberInputField placeholder="0" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormErrorMessage>{errors.quantity}</FormErrorMessage>
              </FormControl>

              {formData.type !== 'adjustment' && (
                <FormControl isRequired isInvalid={!!errors.unitPrice}>
                  <FormLabel>Prix unitaire (€)</FormLabel>
                  <NumberInput
                    value={formData.unitPrice}
                    onChange={(_, valueAsNumber) => setFormData(prev => ({ 
                      ...prev, 
                      unitPrice: isNaN(valueAsNumber) ? 0 : valueAsNumber 
                    }))}
                    min={0}
                    precision={2}
                    step={0.01}
                  >
                    <NumberInputField placeholder="0.00" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormErrorMessage>{errors.unitPrice}</FormErrorMessage>
                </FormControl>
              )}
            </HStack>

            <FormControl isInvalid={!!errors.reference}>
              <FormLabel>Référence (optionnel)</FormLabel>
              <Input
                placeholder="Ex: PO-2024-001, SO-2024-045..."
                value={formData.reference || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
              />
              <FormErrorMessage>{errors.reference}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.reason}>
              <FormLabel>Motif / Commentaire</FormLabel>
              <Textarea
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder={getReasonPlaceholder()}
                rows={3}
              />
              <FormErrorMessage>{errors.reason}</FormErrorMessage>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Annuler
          </Button>
          <Button 
            colorScheme="brand" 
            onClick={handleSubmit}
          >
            {movement ? 'Modifier' : 'Enregistrer'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
