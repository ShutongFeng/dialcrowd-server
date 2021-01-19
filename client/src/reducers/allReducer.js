export default function allReducer(state, action) {
  switch(action.type) {
    case 'ALL':
      return action.all;
    default:
      return state || []
  }
}

