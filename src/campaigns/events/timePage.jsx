import { Component } from 'react';
import { connect } from 'react-redux'; 
import { toCompleteEvent } from '../../actions/campaign';

class TimePage extends Component {
    
    constructor(props) {
        super(props);

        this.state = {
            counter: 0
        }
    }

    componentDidMount() {

        const { condition } = this.props.rule;

        this.timer = setInterval(() => {

            this.setState({
                counter: ++this.state.counter
            });

            if (condition.operator === "less-than-equal-to") {

                if (this.state.counter >= condition.value) { 
                    this.props.toCompleteEvent(this.props.campaignid, this.props.rule.id)
                    clearInterval(this.timer);
                }

            } else if (condition.operator === "more-than-equal-to") {

                this.props.toCompleteEvent(this.props.campaignid, this.props.rule.id);

                if (this.state.counter >= condition.value) {
                    this.props.toCompleteEvent(this.props.campaignid, this.props.rule.id, false);
                    clearInterval(this.timer);
                }
            }
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    render() {
        return null;
    }
}

export default connect(null, { toCompleteEvent })(TimePage);