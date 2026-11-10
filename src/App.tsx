import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { StoreProvider } from './store'
import { AppLayout } from './components/Layout'
import Landing from './pages/Landing'
import { FamilyRegister, Login } from './pages/Auth'
import CaregiverRegister from './pages/CaregiverRegister'
import { CaregiverDashboard, CaregiverOwnProfile, CaregiverRequests, CaregiverSectionEdit } from './pages/CaregiverArea'
import { Results, SearchHome } from './pages/Search'
import { CaregiverPublicProfile, ContactRequestPage } from './pages/Profile'
import { FamilyData, FamilyFavorites, FamilyHelp, FamilyHome, FamilyLayout, FamilyPreferences, FamilyRequests } from './pages/FamilyAccount'
import Messages from './pages/Messages'
import { IntegralService, NotFound, Trust } from './pages/Info'

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Landing />} />
            <Route path="login" element={<Login />} />
            <Route path="registro/familia" element={<FamilyRegister />} />
            <Route path="registro/cuidadora" element={<CaregiverRegister />} />

            <Route path="buscar" element={<SearchHome />} />
            <Route path="buscar/resultados" element={<Results />} />
            <Route path="cuidadoras/:id" element={<CaregiverPublicProfile />} />
            <Route path="cuidadoras/:id/contacto" element={<ContactRequestPage />} />

            <Route path="familia" element={<FamilyLayout />}>
              <Route index element={<FamilyHome />} />
              <Route path="favoritas" element={<FamilyFavorites />} />
              <Route path="solicitudes" element={<FamilyRequests />} />
              <Route path="preferencias" element={<FamilyPreferences />} />
              <Route path="datos" element={<FamilyData />} />
              <Route path="ayuda" element={<FamilyHelp />} />
            </Route>

            <Route path="cuidadora" element={<CaregiverDashboard />} />
            <Route path="cuidadora/perfil" element={<CaregiverOwnProfile />} />
            <Route path="cuidadora/perfil/:section" element={<CaregiverSectionEdit />} />
            <Route path="cuidadora/solicitudes" element={<CaregiverRequests />} />

            <Route path="mensajes" element={<Messages />} />
            <Route path="mensajes/:id" element={<Messages />} />

            <Route path="servicio-integral" element={<IntegralService />} />
            <Route path="confianza" element={<Trust />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  )
}
