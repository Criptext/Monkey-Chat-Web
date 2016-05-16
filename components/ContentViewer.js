import React, { Component } from 'react'

class ContentViewer extends Component {
	constructor(props){
		super(props);
		this.handleImageLoaded=this.handleImageLoaded.bind(this);
	}

	render() {
		return(
			<div className="mky-viewer-image-container">
				<div className="mky-viewer-toolbar">
					<a href={this.props.message.data} download="file" >
						<button className="mky-button-download" title="Download">Download</button>
					</a>
					<button className="mky-button-download" title="Print" >Print</button>
				</div>
				<div id="file_viewer_image" className="mky-viewer-image" >
					<img id="file_image" src={this.props.message.data} onLoad={this.handleImageLoaded} />
				</div>
			</div>
		)
	}

	handleImageLoaded(){
		console.log($('#file_viewer_image').height());
		$('#file_image').css('max-height',$('#file_viewer_image').height()+'px');
	}

}

export default ContentViewer;
