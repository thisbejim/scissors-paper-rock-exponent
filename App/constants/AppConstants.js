var keyMirror = require('react/lib/keyMirror');

module.exports = keyMirror({
  // auth constants
  HANDLE_EMAIL: null,
  HANDLE_PASSWORD: null,
  HANDLE_USERNAME: null,
  HANDLE_LOGIN_SELECT: null,
  LOGIN: null,
  LOGOUT: null,
  REGISTER: null,
  CHECK_AUTH: null,

  // loading
  INITIAL_LOAD: null,
  SELECT_GAME: null,
  SELECT_THEME: null,

  // user component
  TOGGLE_UNIT_ACTIVE: null,
  TOGGLE_UNIT_TYPE: null,
  
  // updating leaderboard after animation
  LEADERBOARD_UPDATE: null,
  SEND_REFS: null,
  
  //animation states
  LOGIN_ANIM_FINISHED: null,
  GAME_ANIM_FINISHED: null,
  
  NEW_USER_GAME: null,
  NEW_USER_GAME_TYPE: null,
  
});