import React, { Component } from 'react'

const Bubble = Component => class extends React.Component {
	constructor(props){
		super(props);
		this.styleName;
	}
  
	render() {
		this.context.userSession;
		let classBubble = this.defineClass();
		if(this.props.message.nameColor){
			this.styleName = { color: this.props.message.nameColor };
		}
		
    	return (
			<div className='mky-message-line'>
				<div id={this.props.message.id} className={classBubble}>
					<div className="mky-message-detail">
					{ this.props.userSessionId === this.props.message.senderId
						? <Status value={this.props.message.status} classStatus={this.defineStatusClass(this.props.message.status)}/>
						: (
							this.props.message.name
							? <span className="mky-message-user-name">{this.props.message.name}</span>
							: null
						)
					}
						<span className="mky-message-hour">{this.props.message.timestamp}</span>
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
        
        return 'mky-status-'+state;
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