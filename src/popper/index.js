import React, { Component } from 'react';
import Modal from './modal';  
import SlideIn from './slideIn';
import FloatingBar from './FloatingBar';
import TopBar from './topBar';

class Popper extends Component{
 
    getPopper(type){
        switch(type){
            case 'popup':
                return Modal; 
            case 'slide-in':
                return SlideIn;
            case 'floating-bar-bottom':
                return FloatingBar;
            case 'floating-bar-top':
                return TopBar;
            default:
                return _ => null;
        }
    }

    renderHTML = ()=>{
        // if(this.props.campaign && this.props.campaign.id === "5d9b6505a43d421124fefc55"){ //this.props.camp.bind_to_indentifier
        //     let ac = document.getElementById('jestry-container')
        //     ac.innerHTML = this.props.campaign.html
        //     return(null)
        // }
        // else
            return(<div dangerouslySetInnerHTML={{ __html: this.props.campaign.html }} ></div>)
    }

    onSubscribe = ()=>{
        console.log("On Subscribe....")
    }

    render(){
        const Popper = this.getPopper(this.props.type)
        return (
            <Popper   {...this.props} onSubscribe={this.onSubscribe} >
                  {this.renderHTML()}
                {this.props.children}
            </Popper>
        )
    }
}

export default Popper;