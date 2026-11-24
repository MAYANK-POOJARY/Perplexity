import { createBrowserRouter } from 'react-router'
import Register from '../features/auth/pages/Register'
import Login from '../features/auth/pages/Login'
import Dashboard from '../features/chat/pages/Dashboard'
import Protected from '../features/auth/components/Protected'
import PrivacyPolicy from '../features/legal/PrivacyPolicy'

export const router = createBrowserRouter([
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/register',
        element: <Register />
    },
    {
        path: '/privacy',
        element: <PrivacyPolicy />
    },
    {
        path: "/",
        element: <Protected>
            <Dashboard />
        </Protected>
    }
])
