/**
 * This is the logout page component
 */

import { useEffect, useState } from 'react'
import axios from 'axios'

const Logout = ({user,setUser}) => {
	/**
	 * When component mounts, initialize values
	 */
	useEffect(()=>{
		document.title = 'Logged Out | Simple Image Annotation' // Set page title

		handleUserLogout() // Force user logout
	},[])

	/**
	 * Handles user logout gracefully
	 */
	 const handleUserLogout = () => {
		if(user){
			// Clear session data on server side
			axios.get('/api/logout').then(res=>{

			},err=>{
				const {code,description} = err.response.data
				alert(`[ Error ${code} ] ${description}`)
			})

			setUser(null)
		}
	}

	return <div style={{padding:'2.5em 0 0 0'}}>
		<h1>Logout Successful</h1>
	</div>
}
 
 export default Logout