import { Component } from 'react';
import { connect } from 'react-redux'; 
import { toCompleteEvent } from '../../actions/campaign';

class ExitIntent extends Component {

    componentDidMount() {

        const { condition } = this.props.rule;

        switch (condition.operator) {
            case 'low':
                return this.addEvent.call(this, 0);
            case 'medium':
                return this.addEvent.call(this, -5);
            case 'high':
                return this.addEvent.call(this, -10);
            default:
                break;
        }

    }

    addEvent(range) {

        document.addEventListener("mouseout", (e) => { 
            
            if (e.clientY <= range){   
                this.props.toCompleteEvent(this.props.campaignid, this.props.rule.id, true, true);
            }
        }, false);
    }

    render() {
        return null;
    }
}

export default connect(null, { toCompleteEvent })(ExitIntent);