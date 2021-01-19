import React, {Component} from 'react';

class QualityWalkthrough extends Component{
    constructor(props) {
        super(props);
    }

    render(){
        return <div>
            <div>
                <img src="/img/quality.png" style={{border:"1px solid black"}}/>
                <br/>
                <br/>
                <div>
                    In addition to calculating the total, average, and standard deviation of time for the questions, 
                    we provide additional bot detection:
                    <br/>
                    <br/>
                    <div>
                        <b>Outlier</b> is set to yes if the total time spent on the task is two standard deviations more or 
                        less than the average time taken by all workers.
                    </div>
                    <br/>
                    <div>
                        <b>Abnormal</b> is set to yes if the worker chose answers in some sort of pattern (A, A, A, or A, B, A, B, etc.).
                    </div>
                    <br/>
                    <div>
                        <b>Intra-User</b> is set if you used duplicate task units. It is the number of consistent answers over the 
                        total number of questions.
                    </div>
                    <br/>
                    <div>
                        <b>Agree-gold</b> is set if you used golden task units. It is the number of answers consistent with the expert over 
                        the total number of questions.
                    </div>
                    <br/>
                    <div>
                        <b>Inter-user</b> is the ratio of annotations that agreed with the majority of the other workers.
                    </div>
                </div>
                <br/>
                <div>
                    Below this is a table with pairwise Cohen's Kappa for each question, and overall, color-coded by the amount of agreement. 
                    We also provide a Gaussian graph of timestamps so that you may also check visually the time it took workers to complete the tasks. 
                    If any of the options above (outlier, abnormal) are set to yes, or if the ratios of intra-user and agree-gold are not equivalent to 1, 
                    or if inter-user agreement is very low, then you may want to check the quality of the workers data.
                </div>
            </div>
        </div>
    }
}

export default QualityWalkthrough;