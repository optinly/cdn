import { Component } from 'react';
import { connect } from 'react-redux'; 
import { toCompleteEvent } from '../../actions/campaign';
import utils from '../../helpers/utils';

class TimeSite extends Component {

    constructor(props) {
        super(props);

        this.state = {
            counter: 0
        }
    }

    componentDidMount() {

        const { condition } = this.props.rule;
        const start = utils.getCookie(this.props.rule.id);
        const date = new Date();
        const now = date.getTime();

        if (start) {
            this.setState({
                counter: Math.trunc((now - start) / 1000)
            });
        } else {
            utils.setCookie(this.props.rule.id, now, parseInt(condition.value,10));
            this.setState({
                counter: 0
            })
        }

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
  
                if (this.state.counter >= condition.value) {  
                    this.props.toCompleteEvent(this.props.campaignid, this.props.rule.id, false);
                    clearInterval(this.timer);
                }else{
                    this.props.toCompleteEvent(this.props.campaignid, this.props.rule.id);
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

export default connect(null, { toCompleteEvent })(TimeSite);