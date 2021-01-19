export default function resultReducer(state, action) {
    switch(action.type) {
        case 'UPDATE_RESULT':
            return {dialog: action.dialog, survey: action.survey};
        default:
            return state || []
    }
}

