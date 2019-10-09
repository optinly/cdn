import React, { Component } from 'react';
import { connect } from 'react-redux'; 
import map from 'lodash/map'; 
import size from 'lodash/size';
import isArray from 'lodash/isArray';
import isUndefined from 'lodash/isUndefined';
import 'bootstrap/dist/css/bootstrap.min.css'
// import 'bootstrap/dist/js/bootstrap.min.js'
import "./App.css";
 
import { load_campaign } from './actions/campaign';
import Campaign from './campaigns/campaign'; 

class App extends Component {

    constructor(props) {

        super(props);    
        
        var app = window.uberpopups.app_id;
        var campaigns = window.uberpopups.campaigns;

        this.state = { app, campaigns }
    }

    render() {
        const { campaigns } = this.props.campaign; 
        
        if (campaigns !== null) return <React.Fragment>{map(campaigns, (camp, k) => <Campaign key={k} camp={camp} />) }</React.Fragment>;

        return null;
    }

    componentDidMount() { 

        const { app, campaigns } = this.state;  
        if(app && (size(campaigns) === 0 || isUndefined(campaigns))){ 
            let site_url = window.location.origin
            this.props.load_campaign(`popup/campaign/list?app_id=${app}&site_url=${site_url}`);
        }else if(isArray(campaigns)){
            this.props.load_campaign( `popup/campaign/view?campaign_id=${campaigns.join(',')}&app_id=${app}`);
        }
 
    }
}


const mapStateToProps = ({ campaign }) => {
    return {
        campaign
    }
}

export default connect(mapStateToProps, { load_campaign })(App);