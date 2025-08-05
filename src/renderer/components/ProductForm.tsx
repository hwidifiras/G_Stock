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
  FormControl,
  FormLabel,
  Input,
  Select,
  Image,
  IconButton,
  InputGroup,
  InputRightElement,
  useToast,
  Text,
  Box,
  Divider,
  SimpleGrid,
  useColorModeValue
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
  image?: string | File
  category?: string
  barcode?: string
  minStock?: number
  unit?: string
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
    image: product?.image || '',
    category: product?.category || '',
    barcode: product?.barcode || '',
    minStock: product?.minStock || 1,
    unit: product?.unit || 'pièce',
  })
  const [imagePreview, setImagePreview] = useState<string>(typeof product?.image === 'string' ? product?.image : '')
  const [categories, setCategories] = useState<string[]>(['Électronique', 'Informatique', 'Accessoires', 'Audio'])
  const [newCategory, setNewCategory] = useState('')
  const [showAddCategory, setShowAddCategory] = useState(false)
  const toast = useToast()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof Product) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    let value: any = e.target.value;
    if (field === 'stock' || field === 'price' || field === 'minStock') value = Number(value);
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, image: file }))
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories(prev => [...prev, newCategory.trim()])
      setFormData(prev => ({ ...prev, category: newCategory.trim() }))
      setNewCategory('')
      setShowAddCategory(false)
      toast({ title: 'Catégorie ajoutée', status: 'success', duration: 2000 })
    }
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!formData.name.trim()) errs.name = 'Nom requis'
    if (!formData.reference.trim()) errs.reference = 'Référence requise'
    if (!formData.category) errs.category = 'Catégorie requise'
    if (!formData.price || formData.price < 0) errs.price = 'Prix requis'
    if (!formData.stock || formData.stock < 0) errs.stock = 'Stock requis'
    if (!formData.minStock || formData.minStock < 0) errs.minStock = 'Seuil requis'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      onSave({ ...formData, id: product?.id })
      onClose()
      setFormData({
        name: '',
        reference: '',
        stock: 0,
        price: 0,
        description: '',
        image: '',
        category: '',
        barcode: '',
        minStock: 1,
        unit: 'pièce',
      })
      setImagePreview('')
    }
  }

  // Style tokens
  const modalBg = useColorModeValue('white', 'navy.800')
  const sectionTitleColor = useColorModeValue('gray.700', 'gray.200')
  const dividerColor = useColorModeValue('gray.200', 'gray.700')
  const inputBg = useColorModeValue('gray.50', 'navy.900')
  const inputBorder = useColorModeValue('gray.200', 'gray.700')

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
      <ModalOverlay />
      <ModalContent bg={modalBg} borderRadius="2xl" boxShadow="2xl" p={1} maxW="900px" w="100%">
        <ModalHeader fontWeight="bold" fontSize="2xl" letterSpacing="tight" color={sectionTitleColor}>
          {product ? 'Modifier le produit' : 'Ajouter un produit'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody px={{ base: 2, md: 6 }} py={2}>
          <HStack align="start" spacing={8} flexDir={{ base: 'column', md: 'row' }} w="100%" maxW="100%">
            {/* Left: Image & Main Info */}
            <VStack spacing={6} align="stretch" flex={1} minW={0} maxW={{ base: '100%', md: '48%' }} w="100%">
              <Text fontWeight="bold" color={sectionTitleColor} fontSize="md" mb={-2}>Informations principales</Text>
              <FormControl>
                <FormLabel fontWeight="semibold">Image du produit</FormLabel>
                <Input type="file" accept="image/*" onChange={handleImageChange} bg={inputBg} borderColor={inputBorder} borderRadius="lg" _focus={{ borderColor: 'brand.500' }} />
                {imagePreview && (
                  <Box mt={2} display="flex" alignItems="center" gap={3}>
                    <Image src={imagePreview} alt="Aperçu" boxSize="64px" borderRadius="lg" objectFit="cover" shadow="md" border="1px solid" borderColor={dividerColor} />
                    <Text fontSize="xs" color="gray.500">Aperçu</Text>
                  </Box>
                )}
              </FormControl>
              <FormControl isRequired isInvalid={!!errors.name}>
                <FormLabel fontWeight="semibold">Nom du produit</FormLabel>
                <Input placeholder="Entrez le nom du produit" value={formData.name} onChange={handleInputChange('name')} bg={inputBg} borderColor={inputBorder} borderRadius="lg" _focus={{ borderColor: 'brand.500' }} />
                {errors.name && <Text color="red.500" fontSize="xs">{errors.name}</Text>}
              </FormControl>
              <FormControl isRequired isInvalid={!!errors.reference}>
                <FormLabel fontWeight="semibold">Référence</FormLabel>
                <Input placeholder="Entrez la référence" value={formData.reference} onChange={handleInputChange('reference')} bg={inputBg} borderColor={inputBorder} borderRadius="lg" _focus={{ borderColor: 'brand.500' }} />
                {errors.reference && <Text color="red.500" fontSize="xs">{errors.reference}</Text>}
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="semibold">Description</FormLabel>
                <Input as="textarea" placeholder="Description du produit (optionnel)" value={formData.description} onChange={handleInputChange('description')} h="80px" maxH="100px" bg={inputBg} borderColor={inputBorder} borderRadius="lg" _focus={{ borderColor: 'brand.500' }} />
              </FormControl>
            </VStack>
            <Divider orientation="vertical" borderColor={dividerColor} h="auto" display={{ base: 'none', md: 'block' }} />
            {/* Right: Stock, Price, Advanced */}
            <VStack spacing={6} align="stretch" flex={1} minW={0} maxW={{ base: '100%', md: '52%' }} w="100%">
              <Text fontWeight="bold" color={sectionTitleColor} fontSize="md" mb={-2}>Stock & Prix</Text>
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} w="100%">
                <FormControl isRequired isInvalid={!!errors.stock}>
                  <FormLabel fontWeight="semibold">Stock initial</FormLabel>
                  <Input type="number" min={0} value={formData.stock} onChange={handleInputChange('stock')} bg={inputBg} borderColor={inputBorder} borderRadius="lg" _focus={{ borderColor: 'brand.500' }} />
                  {errors.stock && <Text color="red.500" fontSize="xs">{errors.stock}</Text>}
                </FormControl>
                <FormControl isRequired isInvalid={!!errors.price}>
                  <FormLabel fontWeight="semibold">Prix unitaire (€)</FormLabel>
                  <Input type="number" min={0} step={0.01} value={formData.price} onChange={handleInputChange('price')} bg={inputBg} borderColor={inputBorder} borderRadius="lg" _focus={{ borderColor: 'brand.500' }} />
                  {errors.price && <Text color="red.500" fontSize="xs">{errors.price}</Text>}
                </FormControl>
              </SimpleGrid>
              <Divider borderColor={dividerColor} />
              <Text fontWeight="bold" color={sectionTitleColor} fontSize="md" mb={-2}>Détails avancés</Text>
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} w="100%">
                <FormControl isInvalid={!!errors.barcode}>
                  <FormLabel fontWeight="semibold">Code-barres / SKU</FormLabel>
                  <Input placeholder="Code-barres ou SKU" value={formData.barcode} onChange={handleInputChange('barcode')} bg={inputBg} borderColor={inputBorder} borderRadius="lg" _focus={{ borderColor: 'brand.500' }} />
                </FormControl>
                <FormControl isRequired isInvalid={!!errors.category}>
                  <FormLabel fontWeight="semibold">Catégorie</FormLabel>
                  <HStack>
                    <Select placeholder="Sélectionnez" value={formData.category} onChange={handleInputChange('category')} bg={inputBg} borderColor={inputBorder} borderRadius="lg" _focus={{ borderColor: 'brand.500' }}>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </Select>
                    <Button size="sm" onClick={() => setShowAddCategory(v => !v)} variant="outline">+</Button>
                  </HStack>
                  {showAddCategory && (
                    <InputGroup size="sm" mt={2}>
                      <Input placeholder="Nouvelle catégorie" value={newCategory} onChange={e => setNewCategory(e.target.value)} bg={inputBg} borderColor={inputBorder} borderRadius="lg" _focus={{ borderColor: 'brand.500' }} />
                      <InputRightElement width="3rem">
                        <IconButton aria-label="Ajouter" size="sm" icon={<Box as="span">✔</Box>} onClick={handleAddCategory} />
                      </InputRightElement>
                    </InputGroup>
                  )}
                  {errors.category && <Text color="red.500" fontSize="xs">{errors.category}</Text>}
                </FormControl>
              </SimpleGrid>
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} w="100%">
                <FormControl isInvalid={!!errors.minStock}>
                  <FormLabel fontWeight="semibold">Seuil d'alerte stock</FormLabel>
                  <Input type="number" min={0} value={formData.minStock} onChange={handleInputChange('minStock')} bg={inputBg} borderColor={inputBorder} borderRadius="lg" _focus={{ borderColor: 'brand.500' }} />
                  {errors.minStock && <Text color="red.500" fontSize="xs">{errors.minStock}</Text>}
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="semibold">Unité</FormLabel>
                  <Select value={formData.unit} onChange={handleInputChange('unit')} bg={inputBg} borderColor={inputBorder} borderRadius="lg" _focus={{ borderColor: 'brand.500' }}>
                    <option value="pièce">Pièce</option>
                    <option value="boîte">Boîte</option>
                    <option value="kg">Kg</option>
                    <option value="litre">Litre</option>
                    <option value="autre">Autre</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
            </VStack>
          </HStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Annuler
          </Button>
          <Button colorScheme="brand" onClick={handleSubmit} fontWeight="bold" borderRadius="lg" px={8} py={2} fontSize="md">
            {product ? 'Modifier' : 'Ajouter'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
