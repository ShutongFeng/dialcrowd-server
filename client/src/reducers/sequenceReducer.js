export default function sequenceReducer(state, action) {
    switch(action.type) {
        case 'UPDATE_SEQUENCE':
            return action.sequence;
        default:
            return state || []
    }
}

