export interface RouteItem {
  name: string
  path: string
  icon?: string
  component?: React.ComponentType
}

const routes: RouteItem[] = [
  {
    name: 'Tableau de bord',
    path: '/',
  },
  {
    name: 'Produits',
    path: '/products', 
  },
  {
    name: 'Mouvements',
    path: '/stock-movements',
  },
  {
    name: 'Rapports',
    path: '/reports',
  },
  {
    name: 'Paramètres',
    path: '/settings',
  },
]

export default routes
