
import axios from 'axios'
import { useEffect, useState } from 'react'
import label from '../globals'

/**
 * Image Annotator Functional Component
 * @param {*} props 
 * @returns fc
 */
 const ImageAnnotator = ({imageData,updateImageArray,maxHeight,maxWidth}) => {
	const [tempImageData,setTempImageData] = useState(imageData)
	const [isLoaded,setLoaded] = useState(false)		// Check if the image has been fully loaded
	const [isMouseDown,setMouseDown] = useState(false)	// Detect if user is interacting with page
	const [isComplete,setComplete] = useState(false)	// Check if annotation has been completed
	const [imgInfo,setImageInfo] = useState({})			// Update image information
	const [dragCoords,setDragCoords] = useState([[0,0],[0,0]])	// Polygon coordinates
	const [naturalCoords,setNaturalCoords] = useState([0,0],[0,0])

	/**
	 * Convert min-max coords into svg-friendly string
	 * @param {*} coords 
	 * @returns 'x1,y1 x1,y2 x2,y2 x2,y1'
	 */
	const stringifyCoords = coords => {
		const [x1,y1] = coords[0]
		const [x2,y2] = coords[1]

		return `${x1},${y1} ${x1},${y2} ${x2},${y2} ${x2},${y1}`
	}
	
	/**
	 * Converts client-scaled coords to image coords
	 * @param {*} coords 
	 * @returns 
	 */
	const client2NaturalCoords = coords => {
		const ratioX = imgInfo.naturalWidth/imgInfo.clientWidth
		const ratioY = imgInfo.naturalHeight/imgInfo.clientHeight

		return	[
			[Math.floor(coords[0][0]*ratioX),Math.floor(coords[0][1]*ratioY)],
			[Math.floor(coords[1][0]*ratioX),Math.floor(coords[1][1]*ratioY)]
		]
	}

	/**
	 * Converts image coords to client-scaled coords
	 * @param {*} coords 
	 * @returns 
	 */
	 const natural2ClientCoords = coords => {
		const ratioX = imgInfo.clientWidth/imgInfo.naturalWidth
		const ratioY = imgInfo.clientHeight/imgInfo.naturalHeight

		return	[
			[Math.floor(coords[0][0]*ratioX),Math.floor(coords[0][1]*ratioY)],
			[Math.floor(coords[1][0]*ratioX),Math.floor(coords[1][1]*ratioY)]
		]
	}

	/**
	 * Convert min-max coords into annotation coords
	 * @param {*} coords 
	 * @returns [[Top, Left], [Bottom, Right]]
	 */
	const buildCoords = coords => {
		const minX = Math.min(coords[0][0],coords[1][0])
		const minY = Math.min(coords[0][1],coords[1][1])
		const maxX = Math.max(coords[0][0],coords[1][0])
		const maxY = Math.max(coords[0][1],coords[1][1])

		return [[minX,minY],[maxX,maxY]]	// Left, Top, Right, Bottom
	}

	/**
	 * Get image parameters after loading
	 * @param {*} evt 
	 */
	const handleOnLoad = evt => {
		// Decompose and store relevant element attributes
		const {
			x,y,			// xy-coords of image relative to viewport
			clientHeight,	// Scaled image height
			clientWidth,	// Scaled image width
			naturalHeight,	// Original image height
			naturalWidth	// Original image width
		} = evt.currentTarget

		setImageInfo({
			x,y,
			clientHeight,clientWidth,
			naturalHeight,naturalWidth
		})

		setLoaded(true)
	}

	/**
	 * Begin drawing annotation polygon
	 * @param {*} evt 
	 */
	const handleMouseDown = evt => {
		evt.stopPropagation()

		// Decompose relevant element attributes
		const {
			clientX,	// X-coords of mouse relative to viewport
			clientY		// Y-coords of mouse relative to viewport
		} = evt.nativeEvent

		// Calculate image pixel coordinates of cursor
		const {x,y} = imgInfo
		const pixelX = clientX-x
		const pixelY = clientY-y
		const pixelXY = [[pixelX,pixelY],[pixelX,pixelY]]

		setDragCoords(pixelXY)	// Reset dragCoords
		setNaturalCoords(client2NaturalCoords(pixelXY))	// Reset naturalCoords
		setMouseDown(true)
		setComplete(false)
	}

	/**
	 * End drawing annotation polygon
	 * @param {*} evt 
	 */
	const handleMouseUp = evt => {
		evt.stopPropagation()

		// Decompose relevant element attributes
		const {
			clientX,	// X-coords of mouse relative to viewport
			clientY		// Y-coords of mouse relative to viewport
		} = evt.nativeEvent

		// Calculate image pixel coordinates of cursor
		const {x,y} = imgInfo
		const pixelX = clientX-x
		const pixelY = clientY-y
		const pixelXY = [dragCoords[0],[pixelX,pixelY]]

		setDragCoords(pixelXY)	// Update dragCoords
		setNaturalCoords(client2NaturalCoords(pixelXY))	// Reset naturalCoords
		setMouseDown(false)

		// Ensure this is not a mis-click by setting a minimum draw distance
		if(Math.abs(dragCoords[0][0]-dragCoords[1][0])>5) setComplete(true)
		else {
			setDragCoords([[0,0],[0,0]]) // Reset coords
		}
	}

	/**
	 * Similar to handleMouseUp, end drawing annotation polygon
	 * @param {*} evt 
	 */
	const handleMouseLeave = evt =>{
		evt.stopPropagation()
		setMouseDown(false)

		// Ensure this is not a mis-click by setting a minimum draw distance
		if(Math.abs(dragCoords[0][0]-dragCoords[1][0])>5) setComplete(true)
		else {
			setDragCoords([[0,0],[0,0]]) // Reset coords
		}
	}

	/**
	 * Continue drawing annotation polygon
	 * @param {*} evt 
	 * @returns 
	 */
	const handleMouseMove = evt => {
		evt.stopPropagation()
		if(!isMouseDown) return	// Ignore non-interactive mouseovers

		// Decompose relevant element attributes
		const {
			clientX,	// X-coords of mouse relative to viewport
			clientY		// Y-coords of mouse relative to viewport
		} = evt.nativeEvent

		// Calculate image pixel coordinates of cursor
		const {x,y} = imgInfo
		const pixelX = clientX-x
		const pixelY = clientY-y
		const pixelXY = [dragCoords[0],[pixelX,pixelY]]

		setDragCoords(pixelXY)	// Update dragCoords
		setNaturalCoords(client2NaturalCoords(pixelXY))	// Reset naturalCoords
	}

	/**
	 * Selecting option from dropdown menu
	 * @param {*} evt 
	 */
	const handleSelection = evt => {
		evt.stopPropagation()

		// Add new coordinates
		const oldCoords = tempImageData.coords
		const newCoords = [
			...oldCoords,
			{
				txt: evt.target.value,
				xy: buildCoords(naturalCoords)
			}
		]

		// Update coordinates in database
		tempImageData.coords = newCoords
		
		const parameters = {
			fnu: tempImageData.fnu,
			doc: {
				coords: newCoords
			}
		}

		axios.post('/api/projects/update',parameters).then(res=>{
			// Success
		},err=>{
			const {code,description} = err.response.data
			alert(`[ Error ${code} ] ${description}`)
		})

		// Reset visuals
		setComplete(false)
		setDragCoords([[0,0],[0,0]])
	}

	return <div>
		<img 
			key={tempImageData.fnu}
			src={tempImageData.url}
			alt={tempImageData.fnu}
			onLoad={handleOnLoad}
			onClick={evt=>evt.stopPropagation()}
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			draggable={false}
			style={{
				maxHeight,maxWidth
			}}
		/>
		{	isLoaded &&
			<svg
				height={imgInfo.clientHeight}
				width={imgInfo.clientWidth}
				style={{
					position: 'absolute',
					zIndex: 1,
					pointerEvents: 'none',
					left: imgInfo.x,
					right: imgInfo.y
				}}
			>
				<polygon points={stringifyCoords(dragCoords)} stroke='#04F404' strokeDasharray='2' fill='none'/>
				{
					tempImageData['coords'].map((data,index)=>{
						const clientXY = natural2ClientCoords(data.xy) // Convert saved natural coordinates to client coordinates

						return <svg
							key={index}
						>
							<polygon 
								points={stringifyCoords(clientXY)}
								stroke='#04F404'
								fill='none'
							/>
							<text
								fill='#04F404'
								x={clientXY[0][0]+5}
								y={clientXY[0][1]+15}
							>{data.txt}</text>
						</svg>
					})
				}
			</svg>
		}
		{	isComplete &&
			<select
				style={{
					position:'absolute',
					left: Math.min(dragCoords[0][0],dragCoords[1][0])+imgInfo.x,
					top: Math.max(dragCoords[0][1],dragCoords[1][1])+imgInfo.y,
				}}
				onClick={evt=>evt.stopPropagation()}
				onChange={handleSelection}
			>
				<option>Choose One</option>
				{
					label.map((item,index)=><option key={index} value={item}>
						{item}
					</option>)
				}
			</select>
		}
	</div>
}

export default ImageAnnotator