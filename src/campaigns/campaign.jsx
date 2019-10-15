import React, { Component } from 'react';
import { connect } from 'react-redux';
import each from 'lodash/each';
import map from 'lodash/map';
import isEqual from 'lodash/isEqual';
import forEach from 'lodash/forEach';
import includes from 'lodash/includes';

import { Engine } from 'json-rules-engine'; 

import utils from '../helpers/utils';
import Popper from '../popper';
import Rules from './rules';
import { addRuleSet, show, sendAnalytics } from '../actions/campaign';




class Campaign extends Component { 
    
    constructor(props) {
        super(props)
        this.handleLoader = this.handleLoader.bind(this)
    }



    handleLoader() {

        const { camp: campaign } = this.props;  
        return (<Popper type={campaign.type} id={campaign.id} campaign={campaign} >
                  
                    <Rules  campaign={campaign} rules={campaign.rules_g.rules} wrapperid={12} campaignid={campaign.id} />
                </Popper>);
    }
 
    componentDidMount(){   
        let campaign = this.props.camp
        sessionStorage.setItem('up-state', JSON.stringify({...campaign,html:""}))
        sessionStorage.setItem('up-subscribe-campaign', campaign.id)


        // {
        //     "email": "danyrupes2@gmail.com", 
        //     "campaign":"{\"site_id\":\"6a2ef32b-ef4c-4547-a650-3463f82914cd\",\"id\":\"5d9b6505a43d421124fefc55\" }",
       
        //     "connection_index":"0",
       
        //     "site_id": "6a2ef32b-ef4c-4547-a650-3463f82914cd",
        //     "subscribe_to":"nonprofit"
        // }



        forEach(document.getElementById(this.props.camp.id).querySelectorAll("a"), a => {
            a.style.cursor = 'pointer';
            a.addEventListener('click', () => {
                let userinfo = utils.uuid();
                // console.log("Clicked")
                this.props.sendAnalytics('click', {
                    last_viewed: new Date(),
                    id: campaign.id, 
                    email: userinfo.email,
                    uid: userinfo.uid,
                    clicked:true
                });
            })
        });
    }

    compileRuleSet(ruleset) { 
        each(ruleset, (rules, campaignid) => { 
            
            if (includes(utils.getLoadedCampaigns(), campaignid) === false && includes(this.props.loadedcampaign, campaignid) === false) {
                let engine = new Engine();  
                engine.addRule({
                    conditions: { ...this.props.ruleSets[campaignid] },
                    event: {
                        type: 'success',
                        params: {
                            message: 'start'
                        }
                    }
                });
                
                engine
                    .run({ ...rules })
                    .then(events => {  
                        map(events, event => {  
                            if (event.params.message === "start") {    
                                this.props.show(campaignid); 
                                let userinfo = utils.uuid();
                                
                                this.props.sendAnalytics('impression', {
                                    last_viewed: new Date(),
                                    id: this.props.camp.key, 
                                    viewed: true,
                                    email: userinfo.email,
                                    uid: userinfo.uid
                                });
                            }
                        }
                        );

                    });
            }

        });
    }
 

    componentWillUpdate(prevProps, prevState) {  
        const { camp: campaign } = this.props;  
        if (!isEqual(prevProps.rulesState[campaign.id], this.props.rulesState[campaign.id]))
            {   
      
                this.compileRuleSet.call(this, { ...prevProps.rulesState });
            }
    }

    render() { 
        console.log("Root")
        return this.handleLoader.call(this);
    }
}

const mapStateToProps = ({ campaign }) => {
    return {
        rulesState: campaign.rulesState,
        ruleSets: campaign.ruleSets,
        loadedcampaign: campaign.loadedCampaign 
    }
}

export default connect(mapStateToProps, { addRuleSet, show, sendAnalytics })(Campaign);