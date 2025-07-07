import { Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import StockMovements from './pages/StockMovements'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import MainLayout from './layouts/MainLayout'

export default function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/stock-movements" element={<StockMovements />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </MainLayout>
  )
}
