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
    path: '/movements',
  },
  {
    name: 'Rapports',
    path: '/reports',
  },
]

export default routes
