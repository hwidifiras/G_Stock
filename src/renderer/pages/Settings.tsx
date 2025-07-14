import {
  Box,
  Heading,
  Text,
  useColorModeValue,
  VStack,
  HStack,
  Switch,
  Button,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Select,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react'
import { useState } from 'react'
import { useColorMode } from '@chakra-ui/react'
import Card from '../components/Card'

export default function Settings() {
  const [notifications, setNotifications] = useState(true)
  const [autoBackup, setAutoBackup] = useState(false)
  const [theme, setTheme] = useState('light')
  const [language, setLanguage] = useState('fr')
  const { colorMode, setColorMode } = useColorMode();

  // Sync Chakra color mode with theme select
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setTheme(value);
    if (value === 'light') setColorMode('light');
    else if (value === 'dark') setColorMode('dark');
    else if (value === 'auto') setColorMode(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  };

  const cardBg = useColorModeValue("white", "navy.700")
  const textColor = useColorModeValue("secondaryGray.900", "white")
  const borderColor = useColorModeValue("gray.200", "navy.600")

  return (
    <Box>
      <Heading size="lg" mb={6} color={textColor}>
        Paramètres
      </Heading>

      <VStack spacing="20px" align="stretch">
        {/* General Settings */}
        <Card bg={cardBg} p="20px" border="1px solid" borderColor={borderColor}>
          <Text fontSize="lg" fontWeight="bold" mb="20px" color={textColor}>
            Paramètres Généraux
          </Text>
          
          <VStack spacing="15px" align="stretch">
            <FormControl>
              <FormLabel>Nom de l'entreprise</FormLabel>
              <Input placeholder="Votre entreprise" defaultValue="Mon Entreprise" />
            </FormControl>
            
            <HStack justify="space-between">
              <FormLabel mb={0}>Langue</FormLabel>
              <Select 
                maxW="200px" 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </Select>
            </HStack>

            <HStack justify="space-between">
              <FormLabel mb={0}>Thème</FormLabel>
              <Select
                maxW="200px"
                value={theme}
                onChange={handleThemeChange}
              >
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
                <option value="auto">Automatique</option>
              </Select>
            </HStack>
          </VStack>
        </Card>

        {/* Notification Settings */}
        <Card bg={cardBg} p="20px" border="1px solid" borderColor={borderColor}>
          <Text fontSize="lg" fontWeight="bold" mb="20px" color={textColor}>
            Notifications
          </Text>
          
          <VStack spacing="15px" align="stretch">
            <HStack justify="space-between">
              <VStack align="start" spacing="2px">
                <Text fontWeight="500">Alertes de stock</Text>
                <Text fontSize="sm" color="gray.500">
                  Recevoir des notifications pour les stocks faibles
                </Text>
              </VStack>
              <Switch 
                isChecked={notifications} 
                onChange={(e) => setNotifications(e.target.checked)}
                colorScheme="brand"
              />
            </HStack>

            <Divider />

            <HStack justify="space-between">
              <VStack align="start" spacing="2px">
                <Text fontWeight="500">Sauvegarde automatique</Text>
                <Text fontSize="sm" color="gray.500">
                  Sauvegarde quotidienne des données
                </Text>
              </VStack>
              <Switch 
                isChecked={autoBackup} 
                onChange={(e) => setAutoBackup(e.target.checked)}
                colorScheme="brand"
              />
            </HStack>
          </VStack>
        </Card>

        {/* Stock Settings */}
        <Card bg={cardBg} p="20px" border="1px solid" borderColor={borderColor}>
          <Text fontSize="lg" fontWeight="bold" mb="20px" color={textColor}>
            Gestion du Stock
          </Text>
          
          <VStack spacing="15px" align="stretch">
            <FormControl>
              <FormLabel>Seuil d'alerte stock faible</FormLabel>
              <Input type="number" placeholder="10" defaultValue="10" />
            </FormControl>
            
            <FormControl>
              <FormLabel>Devise par défaut</FormLabel>
              <Select defaultValue="EUR">
                <option value="EUR">Euro (€)</option>
                <option value="USD">Dollar ($)</option>
                <option value="GBP">Livre Sterling (£)</option>
              </Select>
            </FormControl>
          </VStack>
        </Card>

        {/* Data Management */}
        <Card bg={cardBg} p="20px" border="1px solid" borderColor={borderColor}>
          <Text fontSize="lg" fontWeight="bold" mb="20px" color={textColor}>
            Gestion des Données
          </Text>
          
          <VStack spacing="15px" align="stretch">
            <Alert status="info">
              <AlertIcon />
              <Box>
                <AlertTitle>Sauvegarde des données</AlertTitle>
                <AlertDescription>
                  Vos données sont automatiquement sauvegardées localement.
                </AlertDescription>
              </Box>
            </Alert>

            <HStack spacing="10px">
              <Button colorScheme="brand" variant="outline">
                Exporter les données
              </Button>
              <Button colorScheme="blue" variant="outline">
                Importer des données
              </Button>
              <Button colorScheme="red" variant="outline">
                Réinitialiser
              </Button>
            </HStack>
          </VStack>
        </Card>

        {/* Save Button */}
        <HStack justify="flex-end">
          <Button variant="outline">
            Annuler
          </Button>
          <Button colorScheme="brand">
            Enregistrer les paramètres
          </Button>
        </HStack>
      </VStack>
    </Box>
  )
}
