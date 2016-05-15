import React, { Component } from 'react'

class ContentViewer extends Component {
	constructor(props){
		super(props);
	}
	
	render() {
		return(
			<div className="mky-viewer-image-container">
				<div className="mky-viewer-toolbar">
					<a href={this.props.message.data} download="file" >
						<button className="mky-button-download" title="Download">Download</button>
					</a>
					<button className="mky-button-download" title="Download" >Print</button>
				</div>
				<div id="file_viewer_image" className="mky-viewer-image">
					<img  src={this.props.message.data}/>
				</div>
			</div>
		)
	}

}

export default ContentViewer;