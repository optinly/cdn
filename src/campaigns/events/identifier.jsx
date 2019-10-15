import  { Component }  from 'react';
import { connect } from 'react-redux'; 
import { toCompleteEvent } from '../../actions/campaign';




class Identifier extends Component{ 

    componentDidMount(){
        
        const { condition } = this.props.rule;     
        
        this.triggerFunc();
    }
    
    triggerFunc(){   
        let ac = document.getElementById('jestry-container')
        ac.innerHTML = this.props.campaign.html
        // this.props.toCompleteEvent(this.props.campaignid, this.props.rule.id);
    }

    render(){    
        
        return null;
    }
}  

export default connect(null, { toCompleteEvent })(Identifier);