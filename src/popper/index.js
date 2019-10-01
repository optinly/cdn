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

    onSubscribe = ()=>{
        console.log("On Subscribe....")
    }

    render(){

        const Popper = this.getPopper(this.props.type);

        return (
            <Popper  {...this.props} onSubscribe={this.onSubscribe}>
                {this.props.children}
            </Popper>
        )
    }
}

export default Popper;