import React, { Component } from 'react';
import ContentViewer from './ContentViewer.js';

class ContentModal extends Component {
	constructor(props){
		super(props);
		this.state = {
			messageSelected:this.props.messageSelected,
			visible:''
		}

		this.hideViwer = this.hideViwer.bind(this);
	
	}
	
	render() {
		console.log('render');
		console.log(JSON.stringify(this.props.messageSelected));

		if (this.props.messageSelected != undefined) {
			
			return(
				<div className={'mky-viewer-content ' + this.state.visible}> 
					<button id="mky-button-exit" onClick={this.hideViwer}> X </button> 
					{(() => { 
						switch(this.props.messageSelected.type){
							case 2: 
								console.log()
								return <ContentViewer messageData={this.props.messageSelected.data}/>
								break;
							default:
								return <div>{this.props.messageSelected.data}</div>
								break;
						 }
				    })()}
					<div className="mky-brand-app"></div>
				</div>
				);

		} else {

			return( <div></div> );
		}
	}

	hideViwer(){
		this.props.showModal();
	}
}

export default ContentModal;