/**
 * This is the registration page component
 */

import { useEffect, useState } from 'react'
import axios from 'axios'

import { Button, Input, LinkButton } from '../components/ui'

const IDs = {
	USERNAME: 'usr',
	PASSWORD: 'pas',
	PASSWORD_CONFIRM: 'pas-cfm',
	PROJECT_NAME: 'prj'
}

/**
 * 
 * @param {*} param0 
 * @returns 
 */
const Login = ({setUser}) => {
	// State variables
	const [username,setUsername] = useState('')
	const [password,setPassword] = useState('')

	/**
	 * When component mounts, initialize values
	 */
	useEffect(()=>{
		document.title = 'Login | Simple Image Annotation' // Set page title
	})

	/**
	 * Handles logic for text input
	 * @param {*} evt 
	 */
	const handleTextChange = evt => {
		const {id,value} = evt.target

		switch(id){
			case IDs.USERNAME:
				setUsername(value.replace(/[^A-Z0-9]/gi,''))	// Alphanumeric characters only
				break
			case IDs.PASSWORD: 
				setPassword(value.replace(/\s/g,''))			// No whitespace
				break
			default:
				break
		}
	}

	/**
	 * Register user
	 * @param {*} evt 
	 */
	const handleLogin = evt => {
		evt.preventDefault()
		// Ensure passwords match before proceeding with registration
		if(!username||!password) return alert('Please fill out empty fields')

		const parameters = {
			usr: username,
			pwd: password
		}

		// Login user
		axios.post('/api/login',parameters).then(res=>{
			console.info('Login successful',res)
			setUser(res.data)
		},err=>{
			const {code,description} = err.response.data
			alert(`[ Error ${code} ] ${description}`)
		})
	}

	return <div style={{padding:'2.5em 0 0 0'}}>
		<h1>Login</h1>
		<form>
			<div>
				<label>Username: <Input 
					id={IDs.USERNAME} 
					type='text' 
					value={username}
					onChange={handleTextChange}
					valid
				/></label>
			</div>
			<div>
				<label>Password: <Input
					id={IDs.PASSWORD}
					type='password'
					value={password}
					onChange={handleTextChange}
					valid
				/></label>
			</div>
		</form>
		<div>
			<Button onClick={handleLogin}>Login</Button>
			<LinkButton to='/registration' label='Registration'/>
		</div>
	</div>
}

export default Login