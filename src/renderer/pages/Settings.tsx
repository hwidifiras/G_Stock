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
  AlertDescription,
  Spinner,
  Center,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  SimpleGrid,
  Badge
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useColorMode } from '@chakra-ui/react'
import Card from '../components/Card'
import {
  useSettings,
  useUpdateSettings,
  useUpdateSettingsSection,
  useResetSettings,
  useExportSettings,
  useImportSettings,
  useTestSettings,
  type Settings as SettingsType,
  type SettingsUpdate
} from '../hooks/useSettings'

export default function Settings() {
  const toast = useToast()
  const { colorMode, setColorMode } = useColorMode()
  
  // API hooks
  const { data: settingsData, isLoading, error } = useSettings()
  const updateSettingsMutation = useUpdateSettings()
  const updateSectionMutation = useUpdateSettingsSection()
  const resetSettingsMutation = useResetSettings()
  const exportSettingsMutation = useExportSettings()
  const importSettingsMutation = useImportSettings()
  const testSettingsMutation = useTestSettings()

  // Local state for form data
  const [formData, setFormData] = useState<SettingsType | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  // Initialize form data when settings are loaded
  useEffect(() => {
    if (settingsData?.data) {
      setFormData(settingsData.data)
      // Sync theme with display settings
      if (settingsData.data.display.theme === 'dark') {
        setColorMode('dark')
      } else if (settingsData.data.display.theme === 'light') {
        setColorMode('light')
      }
    }
  }, [settingsData, setColorMode])

  // Handle form field changes
  const handleFieldChange = (section: keyof SettingsUpdate, field: string, value: any) => {
    if (!formData) return
    
    setFormData(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [field]: value
      }
    }))
    setIsDirty(true)
  }

  // Handle theme change
  const handleThemeChange = (value: string) => {
    handleFieldChange('display', 'theme', value)
    if (value === 'light') setColorMode('light')
    else if (value === 'dark') setColorMode('dark')
    else if (value === 'auto') setColorMode(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  }

  // Save all settings
  const handleSaveSettings = async () => {
    if (!formData || !isDirty) return

    const updates: SettingsUpdate = {
      companyInfo: formData.companyInfo,
      inventory: formData.inventory,
      notifications: formData.notifications,
      localization: formData.localization,
      display: formData.display
    }

    updateSettingsMutation.mutate(updates, {
      onSuccess: () => {
        setIsDirty(false)
      }
    })
  }

  // Reset all settings
  const handleResetSettings = () => {
    resetSettingsMutation.mutate(undefined, {
      onSuccess: () => {
        setIsDirty(false)
      }
    })
  }

  // Export settings
  const handleExportSettings = () => {
    exportSettingsMutation.mutate()
  }

  // Import settings
  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string)
        importSettingsMutation.mutate({ settings, merge: true }, {
          onSuccess: () => {
            setIsDirty(false)
          }
        })
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Fichier de paramètres invalide',
          status: 'error',
          duration: 5000,
        })
      }
    }
    reader.readAsText(file)
  }

  // Test settings
  const handleTestSettings = () => {
    testSettingsMutation.mutate()
  }

  const cardBg = useColorModeValue("white", "navy.700")
  const textColor = useColorModeValue("secondaryGray.900", "white")
  const borderColor = useColorModeValue("gray.200", "navy.600")

  // Loading state
  if (isLoading) {
    return (
      <Center h="400px">
        <VStack spacing="4">
          <Spinner size="xl" color="brand.500" />
          <Text>Chargement des paramètres...</Text>
        </VStack>
      </Center>
    )
  }

  // Error state
  if (error || !formData) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Erreur!</AlertTitle>
        <AlertDescription>
          Impossible de charger les paramètres. Veuillez rafraîchir la page.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Box>
      <HStack justify="space-between" align="center" mb={6}>
        <VStack align="start" spacing="1">
          <Heading size="lg" color={textColor}>
            Paramètres
          </Heading>
          <HStack spacing="2">
            <Badge colorScheme="blue" variant="subtle">
              Version {formData.version}
            </Badge>
            {isDirty && (
              <Badge colorScheme="orange" variant="subtle">
                Modifications non sauvegardées
              </Badge>
            )}
          </HStack>
        </VStack>
        
        <HStack spacing="3">
          <Button
            size="sm"
            variant="outline"
            onClick={handleTestSettings}
            isLoading={testSettingsMutation.isPending}
          >
            Tester
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportSettings}
            isLoading={exportSettingsMutation.isPending}
          >
            Exporter
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            as="label"
            htmlFor="import-settings"
            isLoading={importSettingsMutation.isPending}
          >
            Importer
            <input
              id="import-settings"
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleImportSettings}
            />
          </Button>
        </HStack>
      </HStack>

      <VStack spacing="20px" align="stretch">
        {/* Company Information */}
        <Card bg={cardBg} p="20px" border="1px solid" borderColor={borderColor}>
          <Text fontSize="lg" fontWeight="bold" mb="20px" color={textColor}>
            Informations de l'Entreprise
          </Text>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="15px">
            <FormControl>
              <FormLabel>Nom de l'entreprise</FormLabel>
              <Input 
                value={formData.companyInfo.name}
                onChange={(e) => handleFieldChange('companyInfo', 'name', e.target.value)}
                placeholder="Nom de votre entreprise"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input 
                type="email"
                value={formData.companyInfo.email}
                onChange={(e) => handleFieldChange('companyInfo', 'email', e.target.value)}
                placeholder="contact@entreprise.com"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Téléphone</FormLabel>
              <Input 
                value={formData.companyInfo.phone}
                onChange={(e) => handleFieldChange('companyInfo', 'phone', e.target.value)}
                placeholder="+33 1 23 45 67 89"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Site web</FormLabel>
              <Input 
                value={formData.companyInfo.website}
                onChange={(e) => handleFieldChange('companyInfo', 'website', e.target.value)}
                placeholder="https://www.entreprise.com"
              />
            </FormControl>
            
            <FormControl gridColumn={{ base: 1, md: "1 / -1" }}>
              <FormLabel>Adresse</FormLabel>
              <Input 
                value={formData.companyInfo.address}
                onChange={(e) => handleFieldChange('companyInfo', 'address', e.target.value)}
                placeholder="123 Rue de l'Exemple, 75001 Paris"
              />
            </FormControl>
          </SimpleGrid>
        </Card>

        {/* Localization Settings */}
        <Card bg={cardBg} p="20px" border="1px solid" borderColor={borderColor}>
          <Text fontSize="lg" fontWeight="bold" mb="20px" color={textColor}>
            Localisation
          </Text>
          
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing="15px">
            <FormControl>
              <FormLabel>Langue</FormLabel>
              <Select 
                value={formData.localization.language}
                onChange={(e) => handleFieldChange('localization', 'language', e.target.value)}
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="de">Deutsch</option>
                <option value="it">Italiano</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Devise</FormLabel>
              <Select
                value={formData.localization.currency}
                onChange={(e) => handleFieldChange('localization', 'currency', e.target.value)}
              >
                <option value="EUR">Euro (€)</option>
                <option value="USD">Dollar ($)</option>
                <option value="GBP">Livre Sterling (£)</option>
                <option value="CAD">Dollar Canadien (CAD)</option>
                <option value="JPY">Yen (¥)</option>
                <option value="CHF">Franc Suisse (CHF)</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Format de date</FormLabel>
              <Select
                value={formData.localization.dateFormat}
                onChange={(e) => handleFieldChange('localization', 'dateFormat', e.target.value)}
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Format d'heure</FormLabel>
              <Select
                value={formData.localization.timeFormat}
                onChange={(e) => handleFieldChange('localization', 'timeFormat', e.target.value)}
              >
                <option value="24h">24 heures</option>
                <option value="12h">12 heures (AM/PM)</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Fuseau horaire</FormLabel>
              <Select
                value={formData.localization.timezone}
                onChange={(e) => handleFieldChange('localization', 'timezone', e.target.value)}
              >
                <option value="Europe/Paris">Europe/Paris</option>
                <option value="Europe/London">Europe/London</option>
                <option value="America/New_York">America/New_York</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
              </Select>
            </FormControl>
          </SimpleGrid>
        </Card>

        {/* Display Settings */}
        <Card bg={cardBg} p="20px" border="1px solid" borderColor={borderColor}>
          <Text fontSize="lg" fontWeight="bold" mb="20px" color={textColor}>
            Affichage
          </Text>
          
          <VStack spacing="15px" align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing="15px">
              <FormControl>
                <FormLabel>Thème</FormLabel>
                <Select
                  value={formData.display.theme}
                  onChange={(e) => handleThemeChange(e.target.value)}
                >
                  <option value="light">Clair</option>
                  <option value="dark">Sombre</option>
                  <option value="auto">Automatique</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Éléments par page</FormLabel>
                <NumberInput
                  value={formData.display.itemsPerPage}
                  onChange={(_, value) => handleFieldChange('display', 'itemsPerPage', value)}
                  min={5}
                  max={100}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </SimpleGrid>

            <HStack justify="space-between">
              <Text fontWeight="500">Barre latérale réduite</Text>
              <Switch 
                isChecked={formData.display.sidebarCollapsed}
                onChange={(e) => handleFieldChange('display', 'sidebarCollapsed', e.target.checked)}
                colorScheme="brand"
              />
            </HStack>

            <HStack justify="space-between">
              <Text fontWeight="500">Afficher les lignes de grille</Text>
              <Switch 
                isChecked={formData.display.showGridLines}
                onChange={(e) => handleFieldChange('display', 'showGridLines', e.target.checked)}
                colorScheme="brand"
              />
            </HStack>

            <HStack justify="space-between">
              <Text fontWeight="500">Mode compact</Text>
              <Switch 
                isChecked={formData.display.compactMode}
                onChange={(e) => handleFieldChange('display', 'compactMode', e.target.checked)}
                colorScheme="brand"
              />
            </HStack>
          </VStack>
        </Card>

        {/* Inventory Settings */}
        <Card bg={cardBg} p="20px" border="1px solid" borderColor={borderColor}>
          <Text fontSize="lg" fontWeight="bold" mb="20px" color={textColor}>
            Gestion du Stock
          </Text>
          
          <VStack spacing="15px" align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing="15px">
              <FormControl>
                <FormLabel>Seuil d'alerte stock faible</FormLabel>
                <NumberInput
                  value={formData.inventory.lowStockThreshold}
                  onChange={(_, value) => handleFieldChange('inventory', 'lowStockThreshold', value)}
                  min={0}
                  max={1000}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Quantité de réapprovisionnement auto</FormLabel>
                <NumberInput
                  value={formData.inventory.autoReorderQuantity}
                  onChange={(_, value) => handleFieldChange('inventory', 'autoReorderQuantity', value)}
                  min={1}
                  max={10000}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </SimpleGrid>

            <Divider />

            <HStack justify="space-between">
              <VStack align="start" spacing="2px">
                <Text fontWeight="500">Réapprovisionnement automatique</Text>
                <Text fontSize="sm" color="gray.500">
                  Activer les commandes automatiques quand le stock est faible
                </Text>
              </VStack>
              <Switch 
                isChecked={formData.inventory.autoReorderEnabled}
                onChange={(e) => handleFieldChange('inventory', 'autoReorderEnabled', e.target.checked)}
                colorScheme="brand"
              />
            </HStack>

            <HStack justify="space-between">
              <VStack align="start" spacing="2px">
                <Text fontWeight="500">Suivi des dates d'expiration</Text>
                <Text fontSize="sm" color="gray.500">
                  Suivre les dates d'expiration des produits
                </Text>
              </VStack>
              <Switch 
                isChecked={formData.inventory.trackExpiryDates}
                onChange={(e) => handleFieldChange('inventory', 'trackExpiryDates', e.target.checked)}
                colorScheme="brand"
              />
            </HStack>

            <HStack justify="space-between">
              <VStack align="start" spacing="2px">
                <Text fontWeight="500">Suivi des numéros de série</Text>
                <Text fontSize="sm" color="gray.500">
                  Suivre les numéros de série individuels
                </Text>
              </VStack>
              <Switch 
                isChecked={formData.inventory.trackSerialNumbers}
                onChange={(e) => handleFieldChange('inventory', 'trackSerialNumbers', e.target.checked)}
                colorScheme="brand"
              />
            </HStack>

            <HStack justify="space-between">
              <VStack align="start" spacing="2px">
                <Text fontWeight="500">Autoriser stock négatif</Text>
                <Text fontSize="sm" color="gray.500">
                  Permettre les ventes même avec un stock insuffisant
                </Text>
              </VStack>
              <Switch 
                isChecked={formData.inventory.allowNegativeStock}
                onChange={(e) => handleFieldChange('inventory', 'allowNegativeStock', e.target.checked)}
                colorScheme="brand"
              />
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
                isChecked={formData.notifications.lowStockAlerts}
                onChange={(e) => handleFieldChange('notifications', 'lowStockAlerts', e.target.checked)}
                colorScheme="brand"
              />
            </HStack>

            <Divider />

            <HStack justify="space-between">
              <VStack align="start" spacing="2px">
                <Text fontWeight="500">Notifications email</Text>
                <Text fontSize="sm" color="gray.500">
                  Recevoir des notifications par email
                </Text>
              </VStack>
              <Switch 
                isChecked={formData.notifications.emailNotifications}
                onChange={(e) => handleFieldChange('notifications', 'emailNotifications', e.target.checked)}
                colorScheme="brand"
              />
            </HStack>

            <HStack justify="space-between">
              <VStack align="start" spacing="2px">
                <Text fontWeight="500">Notifications SMS</Text>
                <Text fontSize="sm" color="gray.500">
                  Recevoir des notifications par SMS
                </Text>
              </VStack>
              <Switch 
                isChecked={formData.notifications.smsNotifications}
                onChange={(e) => handleFieldChange('notifications', 'smsNotifications', e.target.checked)}
                colorScheme="brand"
              />
            </HStack>

            <Divider />

            <HStack justify="space-between">
              <VStack align="start" spacing="2px">
                <Text fontWeight="500">Rapports quotidiens</Text>
                <Text fontSize="sm" color="gray.500">
                  Recevoir un résumé quotidien par email
                </Text>
              </VStack>
              <Switch 
                isChecked={formData.notifications.dailyReports}
                onChange={(e) => handleFieldChange('notifications', 'dailyReports', e.target.checked)}
                colorScheme="brand"
              />
            </HStack>

            <HStack justify="space-between">
              <VStack align="start" spacing="2px">
                <Text fontWeight="500">Rapports hebdomadaires</Text>
                <Text fontSize="sm" color="gray.500">
                  Recevoir un résumé hebdomadaire par email
                </Text>
              </VStack>
              <Switch 
                isChecked={formData.notifications.weeklyReports}
                onChange={(e) => handleFieldChange('notifications', 'weeklyReports', e.target.checked)}
                colorScheme="brand"
              />
            </HStack>
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
                  Vos données sont automatiquement sauvegardées. 
                  Dernière mise à jour: {new Date(formData.lastUpdated).toLocaleString('fr-FR')}
                </AlertDescription>
              </Box>
            </Alert>

            <HStack spacing="10px" wrap="wrap">
              <Button 
                colorScheme="red" 
                variant="outline"
                onClick={handleResetSettings}
                isLoading={resetSettingsMutation.isPending}
              >
                Réinitialiser tous les paramètres
              </Button>
            </HStack>
          </VStack>
        </Card>

        {/* Save Button */}
        <HStack justify="space-between" pt="4">
          <Text fontSize="sm" color="gray.500">
            Modifié par: {formData.updatedBy || 'Système'}
          </Text>
          
          <HStack spacing="3">
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
              isDisabled={!isDirty}
            >
              Annuler
            </Button>
            <Button 
              colorScheme="brand"
              onClick={handleSaveSettings}
              isLoading={updateSettingsMutation.isPending}
              isDisabled={!isDirty}
            >
              Enregistrer les paramètres
            </Button>
          </HStack>
        </HStack>
      </VStack>
    </Box>
  )
}
