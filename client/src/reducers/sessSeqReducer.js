export default function sessSeqReducer(state, action) {
  switch(action.type) {
    case 'SESSION_SEQUENCE_UPDATE':
      return action.sequence;
    default:
      return state || []
  }
}

