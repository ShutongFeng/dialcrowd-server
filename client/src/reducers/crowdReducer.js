export default function crowdReducer(state, action) {
  switch (action.type) {
    case 'SET_CROWD':
      return action;
    default:
      return state || []
  }
}
