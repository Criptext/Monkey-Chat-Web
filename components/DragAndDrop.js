import React, { Component } from 'react'
import Dropzone from 'react-dropzone'

class DragAndDrop extends React.Component {
	constructor(props) {
		super(props);
	}
	
	render() {
		var style = {
			width: '100%',
			height: '100%'
		}
		return (
			<div className='mky-fullsize jFiler-input-dragDrop'>
				<Dropzone style={style} onDrop={this.onDrop}>
	              <div>Try dropping some files here, or click to select files to upload.</div>
	            </Dropzone>
	        </div>
		)
	}
	
	onDrop(files) {
    	console.log('Received files: ', files);
    }
}

export default DragAndDrop;