export default function sessQualReducer(state, action) {
    switch(action.type) {
      case 'SESSION_QUALITY_UPDATE':
        return action.quality;
      default:
        return state || "text"
    }
  }
  
  