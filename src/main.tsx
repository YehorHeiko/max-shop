import { createRoot } from 'react-dom/client'
import './index.css'
import { OrdersWithStats } from './App.tsx'

createRoot(document.getElementById('root')!).render(
    <OrdersWithStats />
)
