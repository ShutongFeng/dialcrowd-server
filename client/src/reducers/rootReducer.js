import {combineReducers} from 'redux';
import messages from './messagesReducer';
import session from './sessionReducer';
import category from './categoryReducer';
import interactive from './interactiveReducer';
import sequence from './sequenceReducer';
import quality from './qualityReducer';
import session_category from './sessCateReducer';
import session_interactive from './sessInterReducer';
import session_sequence from './sessSeqReducer';
import session_quality from './sessQualReducer';
import result from './resultReducer';
import crowd from './crowdReducer';
import system from "./systemReducer";
import all from "./allReducer";
import listening from './listeningReducer';
import mode from './modeReducer';
import help from './helpReducer';

export default combineReducers({
  messages,
  session,
  category,
  interactive,
  sequence,
  quality,
  system,
  session_category,
  session_interactive,
  session_sequence,
  session_quality,
  result,
  all,
  listening,
  mode,
  help,
  crowd
});

