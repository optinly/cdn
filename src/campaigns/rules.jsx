import React, { Component } from 'react';
import map from 'lodash/map';

import { TimePage,TimeSite, ExitIntent, UrlPath } from './events';

class Rules extends Component {

    handleCampaign(type) {

        switch (type) {

            case 'time-on-page':
                return TimePage;
            case 'time-on-site':
                return TimeSite;
            case 'exit-detected':
                return ExitIntent;
            case 'url-path':
                return UrlPath;
            default:
                return _ => null;
        }
    }

    renderCampaignRules() {

        return map(this.props.rules, (rule, key) => {

            let CampaignRule = this.handleCampaign(rule.type);

            return <CampaignRule key={key} rule={rule} campaignid={this.props.campaignid} />;
        })
    }

    render() {

        return this.renderCampaignRules();
    }
}

export default Rules;