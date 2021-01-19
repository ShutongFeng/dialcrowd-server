import React, {Component} from 'react';

class InteractiveWalkthrough extends Component{
    constructor(props) {
        super(props);
    }

    render(){
        return <div>
        <div>
            <div>
                The interactive task follows the general configuration, consent form, general questions (with an additional A/B test option), 
                and feedback. The only addition is the system add below.
            </div>
            <br/>
            <img src="/img/interactive.png" style={{border:"1px solid black"}}/>
            <br/>
            <br/>
            <div>
                <h4>System Display Name</h4>
                <div>
                    This is the name that will be displayed to the workers for the dialogue system. You <b>DO NOT</b> want to write 
                    "baseline" or anything similar, but instead write something like "System A".
                </div>
                <br/>
                <h4>System</h4>
                <div>
                    You will select your system here. Be sure that you have set the system to public in the "Add System" tab or else it will 
                    not show up here.
                </div>
                <br/>
                <h4>Specific Instructions</h4>
                <div>
                    If you have any specific instructions for this dialogue system compared with any other dialogue systems you may add below, 
                    you can write the instructions here. You can also reiterate the instructions you put in the instructions tab above if they have 
                    not changed.
                </div>
            </div>
        </div>
        </div>
    }
}

export default InteractiveWalkthrough;