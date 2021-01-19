export default function sessInterReducer(state, action) {
  switch(action.type) {
    case 'SESSION_INTERACTIVE_UPDATE':
      return action.interactive;
    default:
      return state || "text"
  }
}

