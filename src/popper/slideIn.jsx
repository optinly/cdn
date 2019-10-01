import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from './css/slideInUp';
import { closeCampaign } from '../actions/campaign';

class SlideIn extends Component {

    constructor(props) {
        super(props);
        this.state = {
            open: false
        }
    }
 
    componentWillUpdate(nextProps) {

        if (nextProps.activecamp !== this.props.activecamp) {
            if (nextProps.activecamp === this.props.id) {
                this.setState({
                    open: true
                });
                this.props.closeCampaign(this.props.id, this.props.campaigns, 'soft');
            } else {

                this.setState({
                    open: false
                });
            }
        }
    }

    componentDidMount( ) {
        // console.log(this.props.children)
    }

    close(type) {

        this.setState({
            open: false
        });
 
        this.props.closeCampaign(this.props.id, this.props.campaigns, type);

    }

    render() {
       
        const display = (this.state.open === true) ? { ...styles.slideInWrapper, ...styles.show } : { ...styles.slideInWrapper };
        return (
            <div style={display} id={this.props.id}>
              <span style={styles.crClose} onClick={this.close.bind(this, 'hard')}>&times;</span>
                {this.props.children}
            </div>
        )
    }
}

const mapStateToProps = ({ campaign }) => {
    return {
        campaigns: campaign.campaigns,
        activecamp: campaign.activeCampaign
    }
}

export default connect(mapStateToProps, { closeCampaign })(SlideIn);