import React, { Component } from 'react'

const Bubble = Component => class extends React.Component {
	constructor(props){
		super(props);
	}
		
	render() {
		let classBubble = this.defineClass();
		let classStatus = this.defineStatusClass(this.props.message.status);
		
    	return (
			<div className='mky-message-line'>
				<div id={this.props.message.id} className={classBubble}>
					<div className="mky-message-detail">
						<Status value={this.props.message.status} classStatus={classStatus}/>
						<span className="mky-message-hour"></span>
					</div>
					<Component {...this.props}/>
				</div>
			</div>
		);
	}
	
	defineStatusClass(status) {
		let state;
		switch(status){
            case 0:
                state = 'load';
                break;
            case 50:
                state = 'sent';
                break;
            case 51:
                state = 'sent';
                break;
            case 52:
                state = 'read';
                break;
        }
        
        return 'myk-status-'+state
	}
	
	defineClass() {
		const prefix = 'mky-';
		const baseClass = 'bubble';
		
		let layerClass = this.props.layerClass;
		
		let side = '';
		if(this.props.userSessionId === this.props.message.senderId){
			side = 'out';
		}else{
			side = 'in';
		}
		
		return prefix+baseClass+' '+prefix+baseClass+'-'+side+' '+prefix+baseClass+'-'+layerClass+' '+prefix+baseClass+'-'+layerClass+'-'+side
	}
}

const Status = ({value, classStatus}) => (
	<div className={"mky-message-status "+classStatus}>
		{value !== 0 ? <i className="fa fa-check"></i> : null}
	</div>
);

export default Bubble;