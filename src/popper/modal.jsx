import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from './css/modal';
import { closeCampaign } from '../actions/campaign';

class Modal extends Component {

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

    close(type) {

        this.setState({
            open: false
        });

        this.props.closeCampaign(this.props.id, this.props.campaigns, type);

    }

    render() {

        const display = (this.state.open === true) ? { ...styles.crModal, ...styles.crShowModal } : { ...styles.crModal };

        return (
            <div style={display} id={this.props.id}>
                <div style={styles.crModalContent}>
                    <span style={styles.crClose} onClick={this.close.bind(this, 'hard')}>&times;</span>
                    {this.props.children}
                </div>
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

export default connect(mapStateToProps, { closeCampaign })(Modal);