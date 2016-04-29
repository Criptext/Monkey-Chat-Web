import React, { Component } from 'react'

class ContentViewer extends Component {
	constructor(props){
		super(props);
		this.state = {
			image_src:this.props.imageSelected,
			visible:''
		}

		this.hideViwer = this.hideViwer.bind(this);
	
	}
	
	componentWillMount() {

	}
	
	render() {

		if (this.state.image_src != undefined) {
			return(
				<div className={'mky-viewer-content ' + this.state.visible}> 
					<div className="mky-viewer-toolbar">
						<button id="mky-button-exit" onClick={this.hideViwer}> X </button> 
						<a href={this.state.image_src} download="file" >
							<button className="mky-button-download" title="Download">Download</button>
						</a>
						<button className="mky-button-download" title="Download" >Print</button>
					</div>
					<div id="file_viewer_image" className="mky-viewer-image">
						<img  src={this.state.image_src}/>
					</div>
					<div className="mky-brand-app"></div>
				</div>
				);
		} else {
			return( <div></div> );
		}
	}

	hideViwer(){
		console.log(this.state.visible);
		this.setState({visible:'hidden-div'});
	}
}

export default ContentViewer;