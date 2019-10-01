import  { Component }  from 'react';
import { connect } from 'react-redux'; 
import { toCompleteEvent } from '../../actions/campaign';
import Url from '../../helpers/url';

let url = new Url(window.location);

const public_methods = {
    'is-any-page':'isInAnyPage',
    'is-the-home-page': 'isTheHomepage',
    'contains': 'contains',
    'get-url':"getUrl",
    'is-the-homepage':"isTheHomepage",
    'is-not-the-homepage':"isNotTheHomepage",
    'exactly-matches':"exactlyMatches",
    'does-not-exactly-match':"doesExactlyMatch", 
    'does-not-contain':"doesNotContain",
    'end-with':"endWith",
    'does-not-end-with':"doesNotEndWith",
    'matches-the-pattern':"matchesThepattern",
}


class UrlPath extends Component{ 

    componentDidMount(){
        
        const { condition } = this.props.rule;     
        
        this.triggerFunc(condition.operator, condition.value);
    }
    
    triggerFunc(name, value){   
        
        if(typeof url[public_methods[name]] === 'function'){    
            if(url[public_methods[name]](value)){      
                this.props.toCompleteEvent(this.props.campaignid, this.props.rule.id);
            }
        } 
    }

    render(){    
        
        return null;
    }
}  

export default connect(null, { toCompleteEvent })(UrlPath);