import TYPES from '../static/Types';
import each from 'lodash/each';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import find from 'lodash/find';
import isInteger from 'lodash/isInteger'; 

import utils from '../helpers/utils';
import axios from '../helpers/axios';
import _get from 'lodash/get';

module.exports = {

    load_campaign: (url) => {

        return (dispatch) => {

            axios(url)
                .then((response) => response.data)
                .then(json => {
                    try {

                        let rules = [];
                        let campaigns = [];
                        let rulesState = [];
                        let rulesInfo = [];

                        each(json.campaigns, (campaign, ck) => {

                            var engine_rules = {
                                values: [],
                                rules: {
                                    all: []
                                }
                            };

                            map(campaign.rules, (value, key) => {

                                let any = [];

                                map(value.all, (v, k) => {
                                    let id = v.any.rule + "-" + v.any.condition + "-" + key + k;

                                    any.push({
                                        fact: id,
                                        operator: "equal",
                                        value: true
                                    });

                                    engine_rules.values.push({
                                        type: v.any.rule,
                                        id,
                                        groupid: key,
                                        condition: {
                                            operator: v.any.condition,
                                            value: v.any.value
                                        }
                                    });
                                });

                                engine_rules.rules.all.push({
                                    any
                                });
                            }); 

                            json.campaigns[ck].rules_g = {
                                rulesets: engine_rules.rules,
                                rules: engine_rules.values
                            }  
                            rules[campaign.id] = (campaign.rules_g.rulesets);
                            campaigns[campaign.id] = campaign;
                            
                            let data = reduce(campaign.rules_g.rules, (item, v) => {

                                item.state[v.id] = false;
                                item.info.push({
                                    id: v.id,
                                    groupid: v.groupid
                                });

                                return item;
                            }, {
                                state: {},
                                info: []
                            });

                            rulesState[campaign.id] = data.state;
                            rulesInfo[campaign.id] = data.info;
                        });

                        // console.log(json)
                        dispatch({
                            type: TYPES.LOAD_CAMP,
                            payload: {
                                campaigns: json,
                                rulesets: rules,
                                rulesState,
                                rulesInfo
                            }
                        });

                    } catch (err) {
                        console.log(err)
                    }
                })
                .catch(() => {
                    dispatch({
                        type: TYPES.LOAD_CAMP_ERR,
                        payload: {
                            message: "Failed to load campaign"
                        }
                    });
                })
        }
    },

    toCompleteEvent: (campaignid, ruleid, b, checkAll) => { 
        return (dispatch) => {

            dispatch({
                type: TYPES.COMPLETE_EVENT,
                payload: {
                    campaignid,
                    ruleid,
                    b,
                    checkAll
                }
            });
        }
    },

    addRuleSet: (campaignid, ruleset) => {

        return (dispatch) => {
            dispatch({
                type: TYPES.ADD_RULESET,
                payload: {
                    campaignid,
                    ruleset
                }
            });
        }
    },

    show: (id) => {
        return (dispatch) => {
            dispatch({
                type: TYPES.TOGGLE,
                payload: id
            });
        }
    },
    closeCampaign: (id, campaigns, type) => {

        let campaign = find(campaigns, {
            id
        });

        if (campaign.options.close_cookie_duration !== false && type === 'hard')
            utils.setLoadedCampaign(id, campaign.options.close_cookie_duration);

        return (dispatch) => {
            dispatch({
                type: TYPES.EVENT_COMPLETED,
                payload: id
            })
        }
    },

    sendAnalytics(type, params={}) {
        return (dispatch) => {
            
            // console.log(params.id)
            if(!_get(window, 'uberpopups.app_id')) //!isInteger(params.id) || 
            return false; 
            
            
            let url = `popup/analytics/campaign/update?campaign_id=${params.id}&app_id=${_get(window, 'uberpopups.app_id')}`;
            
            if(url)
                axios.post(url, params)
                .then((response) => {
                    if(response.data !== false){
                        try{
                            // JSON
                            // console.log(response.data)
                        }catch(error){
                                console.log(error)
                        }
                    }
                        dispatch({
                            type: TYPES.SENT_ANALYTICS,
                            payload: {}
                        })
                }).catch(() => { });
        }
    }
}