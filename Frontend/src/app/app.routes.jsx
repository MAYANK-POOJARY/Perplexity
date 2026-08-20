import { createBrowserRouter } from 'react-router'
import Register from '../features/auth/pages/Register'
import Login from '../features/auth/pages/Login'
import Dashboard from '../features/chat/pages/Dashboard'
import Protected from '../features/auth/components/Protected'

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Protected>
                    <Dashboard />
                </Protected>
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/register',
        element: <Register />
    }
])