import React, { Component } from 'react';
export default class Timer extends Component {

    constructor(props) {

        super(props);

        this.state = {
            min: "00",
            sec: "00",
            totalSeconds: 0
        }
    }

    componentDidMount() {
        setInterval(() => {
            this.setState({
                totalSeconds: ++this.state.totalSeconds,
                sec: this.pad(this.state.totalSeconds % 60),
                min: this.pad(parseInt(this.state.totalSeconds / 60, 10))
            })
        }, 1000);
    }

    pad(val) {
        var valString = val + "";
        if (valString.length < 2) {
            return "0" + valString;
        } else {
            return valString;
        }
    }

    render() {

        return (<div style={{textAlign:"center"}}><div style={{marginTop:"15%", "fontSize":"100px","padding":"10px 20px","display":"inline-block","borderRadius":"5px","color":"white"}}>{this.state.min}:{this.state.sec}</div>
        <div style={{color:"white", fontSize: "11"}}> 
            CARTRABBIT - IN APP
        </div>
        </div>)
    }
}