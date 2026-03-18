import { useAuth } from '@clerk/react'
import React from 'react'

export const Chat = () => {
    const { signOut } = useAuth()
  return (
    <div>
      <h1>Chat Page</h1>
      <button onClick={signOut} className='btn btn-primary'>
        Sign Out
      </button>
    </div>
  )
}


