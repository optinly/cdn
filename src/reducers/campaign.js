import TYPES from '../static/Types'; 
import isUndefined from 'lodash/isUndefined';
import map from 'lodash/map';
import find from 'lodash/find';
import size from 'lodash/size';
import uniq from 'lodash/uniq';

const initialState = {
  campaigns: null,
  ruleSets: null,
  rulesState: {},
  activeCampaign: null,
  loadedCampaign: []
};
const campaignReducer = (state = initialState, action) => {

  switch (action.type) {

    case TYPES.LOAD_CAMP:
      return {
        ...state,
        campaigns: action.payload.campaigns.campaigns,
        ruleSets: action.payload.rulesets,
        rulesState: action.payload.rulesState,
        rulesInfo: action.payload.rulesInfo,
      };

    case TYPES.COMPLETE_EVENT:

      let isTrue = (!isUndefined(action.payload.b)) ? action.payload.b : true;

      if (action.payload.checkAll === true) { 

        let groups = [];
        let completedGroups = [];

        let groupid = find(state.rulesInfo[action.payload.campaignid], { id: action.payload.ruleid });
 
        if(!isUndefined(groupid)){ 

          map(state.rulesInfo[action.payload.campaignid], (v,k) => { 

            let gid =groupid['groupid']; 

            if(v.groupid !== gid){
              groups.push(v.groupid);

              if(state.rulesState[action.payload.campaignid][v.id] === true){
                completedGroups.push(v.groupid);
              }
            }

          });
        }   
        
        isTrue = (size(uniq(groups)) === size(uniq(completedGroups))) ? true : false; 
        
      }   
      
      return {
        ...state,
        rulesState: {
          ...state.rulesState,
          [action.payload.campaignid]: {
            ...state.rulesState[action.payload.campaignid],
            [action.payload.ruleid]: isTrue
          }
        }
      }
    case TYPES.ADD_RULESET: 
      return {
        ...state,
        rulesState: {
          ...state.rulesState,
          [action.payload.campaignid]: action.payload.ruleset
        }
      }
    case TYPES.TOGGLE:

    const loaded = [...state.loadedCampaign];

    if (loaded.indexOf(action.payload) === -1)
      loaded.push(action.payload); 
      return {
        ...state,
        activeCampaign: action.payload,
        loadedCampaign: [...loaded]
      } 

    default:
      return state;
  }
}

export default campaignReducer;