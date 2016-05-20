import React, { Component } from 'react'

class ContentViewer extends Component {
	constructor(props){
		super(props);
		this.handleImageLoaded=this.handleImageLoaded.bind(this);
		this.handleResize=this.handleResize.bind(this);
	}
	componentDidMount() {
    window.addEventListener('resize', this.handleResize);
  }
	handleResize(){

		var height_ = $('#file_viewer_image').parent().height();
		var width_ = $('#file_viewer_image').parent().width();
		$('#viewer-img').css({
				'max-height': height_+'px',
				'max-width': width_+'px'
		});
		console.log('resizing.....', height_ ,' fff ',width_);
	}

	render() {
		return(
			<div className="mky-viewer-image-container">
				<div className="mky-viewer-toolbar">
					<a href={this.props.message.data} download="file" >
						<button className="mky-button-download" title="Download">Download</button>
					</a>
				</div>
				<div id="file_viewer_image" className="mky-viewer-image" >
					<img id="viewer-img" src={this.props.message.data} onLoad={this.handleImageLoaded} />
				</div>
			</div>
		)
	}

	handleImageLoaded(){
		var height_ = $('#file_viewer_image').parent().height();
		var width_ = $('#file_viewer_image').parent().width();
		$('#viewer-img').css({
				'max-height': height_+'px',
				'max-width': width_+'px'
		});
	}

}

export default ContentViewer;
