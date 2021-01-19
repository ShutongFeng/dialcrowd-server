export default function systemReducer(state, action) {
  switch(action.type) {
    case 'UPDATE_SYSTEM':
      return action.system;
    default:
      return state || []
  }
}

