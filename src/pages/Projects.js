/**
 * This is the user projects page component
 */

import { useEffect, useRef, useState } from 'react'
import XLSX from 'xlsx'
import axios from 'axios'

import { Button, Input, LinkButton, Divider } from '../components/ui' 

import ImageAnnotator from '../components/ImageAnnotator'

const Projects = ({user}) => {
	// State variables
	const [projects,setProjects] = useState([])	// Load array of user-created projects
	const [curProject,setCurProject] = useState(null)			// Select a project
	const [imageArray,setImageArray] = useState([]) 			// Load downloaded images here
	const [imageIDArray,setImageIDArray] = useState([])			// Maintain ids of images here
	const [imageSelected,setImageSelected] = useState(null)		// Modal popup for selected image
	const uploadInput = useRef(null)	// Reference the hidden file uploader input

	/**
	 * When component mounts, initialize values
	 */
	useEffect(()=>{
		document.title = 'My Projects | Simple Image Annotation' // Set page title

		// Get list of user projects
		handleProjectsList()
	},[])

	/**
	 * Get list of user projects from server
	 */
	const handleProjectsList = () => {
		const parameters = {
			uid: user.uid
		}

		axios.post('/api/projects/list',parameters).then(res=>{
			console.info('List of projects',res)
			setProjects(res.data)

			setCurProject(res.data[0])
			loadImages(res.data[0])
		},err=>{
			const {code,description} = err.response.data
			alert(`[ Error ${code} ] ${description}`)
		})
	}

	/**
	 * Create new project
	 * @returns 
	 */
	 const handleProjectCreate = evt => {
		evt.preventDefault()
		const newTitle = prompt('New Project Title')

		// Case handling
		if(!newTitle) return // Cancel action

		const filteredTitle = newTitle.replace(/[^A-Z0-9]/gi,'') // Alphanumeric characters only
		if(projects.find(projectDoc=>projectDoc.prj===newTitle)) return alert('Sorry, that project name already exists. Please choose another title.')

		const parameters = {
			uid: user.uid,
			prj: filteredTitle
		}

		// Post project info and create new project if successful
		axios.post('/api/projects/create',parameters).then(res=>{
			console.info('List of projects',res)
			setProjects([
				...projects,
				...res.data
			])
			setCurProject(res.data[0])
			loadImages(res.data[0])
		},err=>{
			const {code,description} = err.response.data
			alert(`[ Error ${code} ] ${description}`)
		})
	}

	/**
	 * Select current project
	 * @param {*} projectDoc
	 */
	const handleProjectSelect = projectDoc => {
		setCurProject(projectDoc)
		loadImages(projectDoc)
	}
	

	/**
	 * Download user images from server from current or input project
	 * @param {*} url 
	 */
	const loadImages = (projectDoc) => {
		const proj = projectDoc || curProject	// Parameter will override state

		const parameters = {
			uid: user.uid,
			pid: proj.pid
		}

		// Retrieves list of image references
		axios.post('/api/projects/images',parameters).then(res=>{
			console.info('List of image ids',res.data)
			setImageArray(res.data)

		},err=>{
			const {code,description} = err.response.data
			alert(`[ Error ${code} ] ${description}`)
		})
	}
	/**
	 * Brings up the full-sized image on a modal
	 * @param {*} parseObj 
	 */
	const handleImageSelect = imageDoc => {
		const selectedImage = imageArray.find(doc=>doc.fnu===imageDoc.fnu)
		setImageSelected(selectedImage)
	}

	/**
	 * Closes the modal
	 * @param {*} evt 
	 */
	const handleImageDeselect = evt => {
		setImageSelected(null)
	}
	/**
	 * Appends or replaces an image in the image array
	 * @param {*} doc 
	 */
	const updateImageArray = imageDoc => {
		const tempImageArray = imageArray.filter(doc=>doc.fnu!==imageDoc.fnu) // Remove image from array
		const newImageData = {
			...imageDoc,
		}
		const newImageArray = [...tempImageArray,newImageData].sort((x,y)=>{	// Return updated image into the array
			if(x.id>y.id) return 1
			if(x.id<y.id) return -1
			return 0
		})
		setImageArray(newImageArray)
	}

	/**
	 * Clear all annotation-related data from image
	 * @param {*} id 
	 */
	 const handleImageClear = imageDoc => {
		const selectedImage = imageArray.find(doc=>doc.fnu===imageDoc.fnu)
		selectedImage.coords = []

		// Update coords in database
		const parameters = {
			fnu: imageDoc.fnu,
			doc: {
				coords: []
			}
		}

		axios.post('/api/projects/update',parameters).then(res=>{
			// Success
		},err=>{
			const {code,description} = err.response.data
			alert(`[ Error ${code} ] ${description}`)
		})
	}

	/**
	 * Handles file selection
	 * @param {*} evt 
	 */
	const handleUploadSelect = evt => {
		evt.preventDefault()

		const {files} = evt.target
		console.dir(evt.target.files)
		if(files.length > 0){
			// Upload multiple images to the server
			const formData = new FormData()
			formData.append('uid',user.uid)
			formData.append('pid',curProject.pid)

			// Append list of images into form data
			const uploadFiles = [...files]
			formData.append('count',uploadFiles.length)
			uploadFiles.forEach((file,index)=>{
				formData.append('images',files[index]) // Dynamically appends files to formData
			})

			axios({
				method: 'post',
				url: '/api/projects/upload',
				data: formData,
				headers: {'Content-Type': 'multipart/form-data'}
			}).then(res=>{
				console.info('Images uploaded',res)
				loadImages() // Hard refresh image list
			},err=>{
				const {code,description} = err.response.data
				alert(`[ Error ${code} ] ${description}`)
			})
		}
	}

	/**
	 * Uploads image(s) to the database
	 * @param {*} evt 
	 */
	const handleUploadConfirm = evt => {
		uploadInput.current.click()
	}

	/**
	 * Client downloads set of annotations for selected image
	 */
	const handleDownloadAnnotations = () => {
		// Get basic data
		const imageName = imageSelected['fnu'].split('.')[1] // We remove the unique identified of the image name first
		const imageCoords = imageSelected['coords']

		// Don't bother downloading if there are no coordinates
		if(!imageCoords.length) return alert('No annotations found for this image.')

		// Construct JSON of image annotation data
		const outputData = imageCoords.map(coord=>{
			const {txt,xy} = coord
			return {
				filename: imageName,
				class: txt,
				top: xy[0][1],
				left: xy[0][0],
				bottom: xy[1][1],
				right: xy[1][0]
			}
		})

		// Construct output workbook
		const wb = XLSX.utils.book_new()
		const ws = XLSX.utils.json_to_sheet(outputData)
		XLSX.utils.book_append_sheet(wb,ws,'annotations')

		// Download output as CSV
		const outputName = imageName.split('.')[0] // Remove file extension from image name
		XLSX.writeFile(wb,`${outputName}.csv`)
	}

	/**
	 * Client downloads set of annotations for all existing image
	 */
	 const handleDownloadAnnotationsAll = () => {
		// Get basic data
		const outputDataAll = imageArray.reduce((temp,imageDoc)=>{
			const imageName = imageDoc['fnu'].split('.')[1] // We remove the unique identified of the image name first
			const imageCoords = imageDoc['coords']

			// If image does not have coords, skip to next loop
			if(!imageCoords.length) return temp

			// Construct JSON of image annotation data
			const outputData = imageCoords.map(coord=>{
				const {txt,xy} = coord
				return {
					filename: imageName,
					class: txt,
					top: xy[0][1],
					left: xy[0][0],
					bottom: xy[1][1],
					right: xy[1][0]
				}
			})

			// Append current image data to temp array
			return [
				...temp,
				...outputData
			]
		},[])

		// Construct output workbook
		const wb = XLSX.utils.book_new()
		const ws = XLSX.utils.json_to_sheet(outputDataAll)
		XLSX.utils.book_append_sheet(wb,ws,'annotations')

		// Download output as CSV
		const outputName = `${curProject['prj']}`
		XLSX.writeFile(wb,`${outputName}.csv`)
	}

	return <div style={{padding:'2.5em 5em 2.5em 5em'}}>
		<h1>{user.usr.toUpperCase()}'s Projects { curProject && `>> ${curProject.prj}`}</h1>
		<div>
			{ projects && 'Select Project:  '}
			{	projects &&
				projects.map(projectDoc=><Button
					key={projectDoc.pid}
					active={curProject && curProject.prj===projectDoc.prj}
					onClick={()=>handleProjectSelect(projectDoc)}
				>{projectDoc.prj}</Button>)	
			}
			{projects && ' | '}
			<Button 
				onClick={handleProjectCreate}
			>+ Create New Project</Button>
		</div>
		{	curProject &&
			<div>
				<Button 
					onClick={handleDownloadAnnotationsAll}
				>Download CSV [ All Images ]</Button>
				<input 
					ref={uploadInput}
					type='file'
					accept='image/*' 
					multiple
					hidden
					onChange={handleUploadSelect}
				/>
				{' | '}
				<Button onClick={handleUploadConfirm}>+ Upload New Images</Button>
			</div>
			
		}
		<div>
			{	imageSelected &&
					<div 
						style={{
							backgroundColor: 'rgba(0,0,0,.8)',
							position: 'fixed',
							top: '0px',
							left: '0px',
							height: '100vh',
							width: '100vw',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',

						}}
					>
						<div>
							<div style={{ float: 'left' }}>
								<Button
									onClick={()=>handleImageClear(imageSelected)}
									warning
								>Clear</Button>
							</div>
							<div style={{ float: 'right' }}>
								<Button
									onClick={handleImageDeselect}
									danger
								>X</Button>
							</div>
							<ImageAnnotator
								imageData={imageSelected}
								maxHeight='90vh'
								maxWidth='90vw'
								{...{
									updateImageArray,
								}}
							/>
							<div>
								<Button width='100%'
									onClick={handleDownloadAnnotations}
								>Download CSV</Button>
							</div>
						</div>
					</div>
			}
			<Divider/>
			{
				imageArray.map(imageDoc=>{
					if(!imageDoc?.fnu) return null // If url does not exist, don't bother rendering this
					return <img
						key={imageDoc.fnu}
						src={`./api/image/${imageDoc.fnu}`}
						alt={imageDoc.fnu}
						style={{
							// Scale down full-sized images into thumbnails
							height: '150px',
							width: '150px',
							margin: '.5em .5em 0 0',
							// Annotated images should look special
							border: `${imageDoc.coords.length > 0 ? '.1em solid gold' : '.1em dashed white'}`,
							// We don't stretch the image, we crop it to fit dimensions
							objectFit: 'cover',
							objectPosition: 'center',

						}}
						onClick={()=>handleImageSelect(imageDoc)}
						draggable={false}
					/>
				})
			}
		</div>
	</div>
}

export default Projects