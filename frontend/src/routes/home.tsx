import { Container, Box, Typography, Link } from '@mui/material'
import { useAuth, User } from '../contexts/auth'
import userService from '../services/user.service'
import { useEffect, useState} from 'react'



export default function Home() {
  const [users, setUsers] = useState([]);

  console.log("loading Models List")
  useEffect(() => {
    (async () => {
      console.log("oooooooo")
      var users = []
      users = userService.getUsers()
      setUsers(users)
      console.log(users)
    })

  }, []);

  return (
    <div>
      aa
      {users}
  </div>
  )
}
