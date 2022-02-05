
/**
 * This is the app container component. 
 */

import { Fragment, useEffect, useState } from 'react'
import { Link, Route, Routes, Navigate, useLocation } from 'react-router-dom'
import axios from 'axios'

// Pages
import PageLogin from './pages/Login'
import PageRegistration from './pages/Registration'
import PageProjects from './pages/Projects'
import PageLogout from './pages/Logout'

// UI Components
import { Button, Input, Container, NavBar, NavBarTitle, NavBarSection, LinkButton } from './components/ui'

export default function App() {
	const [user,setUser] = useState(null)

	/**
	 * When component mounts, initialize values
	 */
	 useEffect(()=>{
		document.title = 'Simple Image Annotation' // Set page title

		axios.post('/api/session').then(res=>{
			setUser(res.data)
		},err=>{
			// do nothing
		})
	},[])

	return <Container>
		<NavBar static={true}>
			<NavBarTitle><b>Simple Image Annotation</b></NavBarTitle>
			{	!user &&
				<Fragment>
					<NavBarSection>
						<LinkButton to='/registration' label='Registration'/>
					</NavBarSection>
					<NavBarSection>
						<LinkButton to='/login' label='Login'/>
					</NavBarSection>
				</Fragment>
			}
			{	user &&
				<Fragment>
					<NavBarSection>
						<LinkButton to='/my-projects' label='My Projects'/>
					</NavBarSection>
					<NavBarSection>
						<LinkButton to='/logout' label='Logout'/>
					</NavBarSection>
				</Fragment>
			}
		</NavBar>
		<Routes>
			<Route exact path='/' element={
				// We redirect to the proper page based on user authentication status
				user ? 
				<Navigate replace to='/my-projects'/> : 
				<Navigate replace to='/registration'/>
			}>
			</Route>
			<Route path='logout' element={
				<PageLogout {...{user,setUser}}/>
			}/>
			<Route path='login' element={
				// We redirect to the proper page based on user authentication status
				user ? 
				<Navigate replace to='/my-projects'/> :
				<PageLogin {...{setUser}}/>
			}/>
			<Route path='registration' element={
				// We redirect to the proper page based on user authentication status
				user ? 
				<Navigate replace to='/my-projects'/> :
				<PageRegistration {...{setUser}}/>
			}/>
			<Route path='my-projects' element={
				// We redirect to the proper page based on user authentication status
				user ? 
				<PageProjects {...{user}}/> : 
				<Navigate replace to='/login'/>
			}/>
		</Routes>
	</Container>
}