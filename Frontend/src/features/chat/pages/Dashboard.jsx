import React from 'react'
import { useSelector } from 'react-redux'

const Dashboard = () => {
    // checking the user data
    const {user} = useSelector(state => state.auth);
    console.log(user)

    return (
        <div>
            Dashboard
        </div>
    )
}

export default Dashboard
