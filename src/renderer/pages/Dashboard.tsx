import { Box, Grid, Heading, Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/react'

export default function Dashboard() {
  return (
    <Box>
      <Heading size="lg" mb={6}>Tableau de bord</Heading>
      
      <Grid templateColumns="repeat(3, 1fr)" gap={6}>
        <Stat bg="white" p={4} rounded="lg" shadow="sm">
          <StatLabel>Total Produits</StatLabel>
          <StatNumber>0</StatNumber>
          <StatHelpText>En stock</StatHelpText>
        </Stat>
        
        <Stat bg="white" p={4} rounded="lg" shadow="sm">
          <StatLabel>Valeur Totale</StatLabel>
          <StatNumber>0.00 €</StatNumber>
          <StatHelpText>Stock actuel</StatHelpText>
        </Stat>
        
        <Stat bg="white" p={4} rounded="lg" shadow="sm">
          <StatLabel>Produits Faibles</StatLabel>
          <StatNumber>0</StatNumber>
          <StatHelpText>Stock à renouveler</StatHelpText>
        </Stat>
      </Grid>
    </Box>
  )
}
