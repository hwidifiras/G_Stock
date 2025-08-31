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
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useColorModeValue,
  Text
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useProducts } from '../hooks/useProducts'
import { useCreateMovement, useUpdateMovement, type CreateMovementData } from '../hooks/useStockMovements'

interface StockMovementFormProps {
  isOpen: boolean
  onClose: () => void
  movement?: any // Any existing movement to edit
}

export default function StockMovementForm({ 
  isOpen, 
  onClose, 
  movement 
}: StockMovementFormProps) {
  // Color theme
  const mutedTextColor = useColorModeValue('secondaryGray.600', 'secondaryGray.400')
  
  // Fetch products for dropdown
  const { data: productsResponse } = useProducts()
  const products = productsResponse?.data || []
  
  // API mutations
  const createMovement = useCreateMovement()
  const updateMovement = useUpdateMovement()
  
  const [formData, setFormData] = useState<CreateMovementData>({
    productId: '',
    type: 'entry',
    quantity: 0,
    reason: 'purchase',
    unitPrice: 0,
    description: '',
    reference: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (movement) {
      setFormData({
        productId: movement.product?.id || '',
        type: movement.type,
        quantity: Math.abs(movement.quantity),
        reason: movement.reason,
        unitPrice: movement.unitPrice || 0,
        description: movement.description || '',
        reference: movement.reference || ''
      })
    } else {
      setFormData({
        productId: '',
        type: 'entry',
        quantity: 0,
        reason: 'purchase',
        unitPrice: 0,
        description: '',
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
      const product = products.find(p => p._id === formData.productId)
      if (product && Math.abs(formData.quantity) > product.quantity) {
        newErrors.quantity = `Stock insuffisant (disponible: ${product.quantity})`
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

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const movementData: CreateMovementData = {
        ...formData,
        quantity: formData.type === 'exit' ? -Math.abs(formData.quantity) : 
                 formData.type === 'adjustment' ? formData.quantity : 
                 Math.abs(formData.quantity)
      }
      
      if (movement?.id) {
        await updateMovement.mutateAsync({ id: movement.id, data: movementData })
      } else {
        await createMovement.mutateAsync(movementData)
      }
      
      onClose()
    } catch (error) {
      console.error('Error saving movement:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      productId: '',
      type: 'entry',
      quantity: 0,
      reason: 'purchase',
      unitPrice: 0,
      description: '',
      reference: ''
    })
    setErrors({})
    onClose()
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

  const getSelectedProductStock = () => {
    const product = products.find(p => p._id === formData.productId)
    return product?.quantity || 0
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
                {products.map(product => (
                  <option key={product._id} value={product._id}>
                    {product.name} (Stock: {product.quantity})
                  </option>
                ))}
              </Select>
              {formData.productId && (
                <Text fontSize="sm" color={mutedTextColor} mt={1}>
                  Stock actuel: {getSelectedProductStock()} • 
                  Catégorie: {products.find(p => p._id === formData.productId)?.category}
                </Text>
              )}
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

            <FormControl isInvalid={!!errors.description}>
              <FormLabel>Description (optionnel)</FormLabel>
              <Input
                placeholder="Description supplémentaire..."
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
              <FormErrorMessage>{errors.description}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.reason}>
              <FormLabel>Motif</FormLabel>
              <Select
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Sélectionnez un motif"
              >
                {formData.type === 'entry' && (
                  <>
                    <option value="purchase">Achat fournisseur</option>
                    <option value="return">Retour client</option>
                    <option value="initial_stock">Stock initial</option>
                    <option value="other">Autre</option>
                  </>
                )}
                {formData.type === 'exit' && (
                  <>
                    <option value="sale">Vente</option>
                    <option value="damage">Dommage</option>
                    <option value="loss">Perte</option>
                    <option value="theft">Vol</option>
                    <option value="expired">Expiré</option>
                    <option value="other">Autre</option>
                  </>
                )}
                {formData.type === 'adjustment' && (
                  <>
                    <option value="correction">Correction inventaire</option>
                    <option value="quality_control">Contrôle qualité</option>
                    <option value="other">Autre</option>
                  </>
                )}
              </Select>
              <FormErrorMessage>{errors.reason}</FormErrorMessage>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button 
            colorScheme="brand" 
            onClick={handleSubmit}
            isLoading={isLoading}
            loadingText={movement ? 'Modification...' : 'Enregistrement...'}
          >
            {movement ? 'Modifier' : 'Enregistrer'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
