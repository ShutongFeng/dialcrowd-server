export default function sessionReducer(state, action) {
  switch(action.type) {
        case 'SESSION_UPDATE':
            return action.session;
        default: 
            return state || "text";
    }
}

