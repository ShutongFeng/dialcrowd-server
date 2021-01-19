import React, {Component} from 'react';

class AddSystemWalkthrough extends Component{
    constructor(props) {
        super(props);
    }

    render(){
        return <div>
            <div>
                <img src="/img/addsystem.png" style={{border:"1px solid black"}}/>
                <br/>
                <br/>
                <div>
                    After filling out the other fields for adding a dialogue system, there are 2 fields that require additional explanation. 
                    First, the Url field is the url that your dialogue system is hosted on. Secondly, there are two types: public and private. 
                    The public option will make the dialogue system available to be added into an interactive task, while private will not make 
                    the system available.
                </div>
            </div>
            <br/>
            <div>
                <img src="/img/system.png" style={{border:"1px solid black"}}/>
                <br/>
                <br/>
                <div>
                    The three options here, in order, are: the link to the GitHub, the option to edit any of the fields you just filled out, 
                    and the option to speak with your bot to ensure that it has been connected properly.
                </div>
            </div>
        </div>

    }
}

export default AddSystemWalkthrough;