import styled from 'styled-components'
import {Link,useMatch} from 'react-router-dom'

const color = {
	white: 'white',

	drysack: '#BDAD98',
    wetsack: '#89827A',

    powder: '#383D40',
    blue: '#2D3032',
    navy: '#242627',
    stone: '#202325',
    asphalt: '#171C1F',

    danger: '#E04836',
    dangerDown: 'rgb(197,38,21)',
    warning: '#F7CE3E',
    warningDown: 'rgb(247,128,0)',
    info: '#516B98',
    infoDown: '#9CC7F6',
    success: '#A3F086',
    successDown: '#64B63D',
}

/**
 * Wraps around page component, ensures no overflow
 */
 export const Container = styled.div`
 display: flex;
 justify-content: center;
 text-align: center;
 margin: 0px;
 width: 100vw;
 height: 100vh;
 background-color: ${color.asphalt};
`

/**
* Header navbar
*/
export const NavBar = styled.div`
 position: fixed;
 text-align: left;
 top: ${props=>props.static ? '0em' : '-1.5em'};
 width: 100%;
 padding: .5em 1em;
 background-color: ${color.DARK};
 box-shadow: 0em 0em .25em .1em black;
 opacity: ${props=>props.static ? 1 : 0};
 transition: all .1s ease-in;

 :hover {
     opacity: 100%;
     top: 0em;
     transition: all .1s ease-out;
 }
`

/**
* Sapces out NavBar elements (essentially a div)
*/
export const NavBarTitle = styled.div`
 display: inline;
 padding: 0em 1em;
`

/**
* Sapces out NavBar elements (essentially a div)
*/
export const NavBarSection = styled.div`
 display: inline;
 padding-right: .5em;
`

/*=================================================
					UI Elements
=================================================*/

export const Button = styled.button`
	border: .01em solid white;
	color: ${color.white};
	background: ${props => props.progress || ''};
	background-color: ${props => props.warning ? color.warning : props.danger ? color.danger : (props.active ? color.infoDown : color.blue)};
	padding: .25em .5em;
	text-align: center;
	text-decoration: none;
	text-shadow: .05em .05em .2em ${color.asphalt};
	outline: 0em;
	${props=>props.disabled ? 'cursor: default;' : 'cursor: pointer;'}
	user-select: text;
	margin: .25em;
	width: ${props=>props.width || (props.fluid ? '95%' : '')};

	&:hover {
		color: ${color.white};
		background-color: ${color.infoDown};
	}
`

export const Input = styled.input`
	padding: .25em;
	margin-top: .25em;
	margin-bottom: .25em;
	text-align: center;
	background-color: ${props=>props.valid ? 'white' : 'rgba(0,0,0,0)'};
	border: .1em solid white;
	/* text-shadow: .05em .05em .4em black, .05em .05em .2em black, 0em 0em .1em black; */
	box-shadow: inset .05em .05em .2em black;
	color: ${props=>props.valid ? 'black' : 'white'};
	width: ${props=>props.width || '50%'};
`

export const Divider = styled.div`
	background-color: white;
	height: .1rem;
	margin: .25rem;
`

// Renders a button-based link, button will show active state when page route matches button address
export const LinkButton = ({label,to,activeOnlyWhenExact,disabled}) => {
	const match = useMatch({
		path: to,
		exact: activeOnlyWhenExact
	})
	return <Link {...{to}} style={{textDecoration:'none',pointerEvents: disabled ? 'none' : 'pointer'}}>
		<Button active={match} {...{disabled}}>{match && '✔️'} {label}</Button>
	</Link>
}