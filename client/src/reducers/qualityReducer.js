export default function qualityReducer(state, action) {
    switch (action.type) {
      case 'UPDATE_QUALITY':
        return action.quality;
      default:
        return state || []
    }
  }
  