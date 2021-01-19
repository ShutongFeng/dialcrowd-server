export default function interactiveReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_INTERACTIVE':
      return action.interactive;
    default:
      return state || []
  }
}
