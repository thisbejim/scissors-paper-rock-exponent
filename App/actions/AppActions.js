var AppDispatcher = require('../dispatcher/AppDispatcher');
var AppConstants = require('../constants/AppConstants');

var AppActions = {
  handleEmail: function(data) {
    AppDispatcher.dispatch({
      actionType: AppConstants.HANDLE_EMAIL,
      data: data
    });
  },
  handleUsername: function(data) {
    AppDispatcher.dispatch({
      actionType: AppConstants.HANDLE_USERNAME,
      data: data
    });
  },
  handlePassword: function(data) {
    AppDispatcher.dispatch({
      actionType: AppConstants.HANDLE_PASSWORD,
      data: data
    });
  },
  handleLoginSelect: function() {
    AppDispatcher.dispatch({
      actionType: AppConstants.HANDLE_LOGIN_SELECT
    });
  },
  handleRegisterSelect: function() {
    AppDispatcher.dispatch({
      actionType: AppConstants.HANDLE_REGISTER_SELECT
    });
  },
  login: function(email, password) {
    AppDispatcher.dispatch({
      actionType: AppConstants.LOGIN,
      email: email,
      password: password
    });
  },
    logout: function() {
      AppDispatcher.dispatch({
        actionType: AppConstants.LOGOUT
      });
    },
  register: function(email, password, username) {
    AppDispatcher.dispatch({
      actionType: AppConstants.REGISTER,
      email: email,
      password: password,
      username: username
    });
  },
  initialLoad: function() {
    AppDispatcher.dispatch({
      actionType: AppConstants.INITIAL_LOAD
    });
  },
  checkAuth: function() {
    AppDispatcher.dispatch({
      actionType: AppConstants.CHECK_AUTH
    });
  },
  toggleUnitActive: function(user, active) {
    AppDispatcher.dispatch({
      actionType: AppConstants.TOGGLE_UNIT_ACTIVE,
      user: user,
      active: active
    });
  },
  toggleUnitType: function(user, type) {
    AppDispatcher.dispatch({
      actionType: AppConstants.TOGGLE_UNIT_TYPE,
      user: user,
      type: type
    });
  },
  selectGame: function(game) {
    AppDispatcher.dispatch({
      actionType: AppConstants.SELECT_GAME,
      game: game
    });
  },
  selectTheme: function(theme) {
    AppDispatcher.dispatch({
      actionType: AppConstants.SELECT_THEME,
      theme: theme
    });
  },
  leaderboardUpdate: function(userData) {
    AppDispatcher.dispatch({
      actionType: AppConstants.LEADERBOARD_UPDATE,
      userData: userData
    });
  },
  sendRefs: function(Leaderboard) {
      AppDispatcher.dispatch({
      actionType: AppConstants.SEND_REFS,
      Leaderboard: Leaderboard
    });
  },
  loginAnimationFinished: function(){
    AppDispatcher.dispatch({
      actionType: AppConstants.LOGIN_ANIM_FINISHED,
    });
  },
  gameAnimationFinished: function(){
    AppDispatcher.dispatch({
      actionType: AppConstants.GAME_ANIM_FINISHED,
    });
  },
  handleNewUserGameType: function(game){
    AppDispatcher.dispatch({
      actionType: AppConstants.NEW_USER_GAME_TYPE,
      game: game
    });
  },
  createNewUserGame: function(game){
    AppDispatcher.dispatch({
      actionType: AppConstants.NEW_USER_GAME,
      game: game
    });
  },
};

module.exports = AppActions;