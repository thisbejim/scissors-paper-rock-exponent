var React = require('react-native');
var {
  AppRegistry,
  AsyncStorage,
  Image,
  ListView,
  LayoutAnimation,
  Animated,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  TextInput,
  TabBarIOS,
  Dimensions
} = React;

var Firebase = require('firebase');
var ref = new Firebase("https://leaderboardapp.firebaseio.com/leaderboard");
var _ = require('underscore');
var AppActions = require('./App/actions/AppActions');
var AppStore = require('./App/stores/AppStore');

// components
var HomeView = require('./App/components/HomeView');
var LoginView = require('./App/components/Auth/LoginView');
var GameSelectView = require('./App/components/GameSelect/GameSelectView');
var ThemeSelectView = require('./App/components/ThemeSelect/ThemeSelectView');
var LoadingView = require('./App/components/Loading/LoadingView');
var MatchView = require('./App/components/Match/MatchView');


function getState() {
  return AppStore.getState();
}

var SPR = React.createClass({
  displayName: "Main Component",
  getInitialState: function() {
    return getState();
  },
  componentWillMount: function() {
    AppStore.checkAuth();
  },
  componentDidMount: function() {
    AppStore.addChangeListener(this._onChange);
  },
  componentWillUnmount: function() {
    AppStore.removeChangeListener(this._onChange);
  },
  render: function() {
    // game views
    if(!this.state.authStorageChecked) {
      // render white screen initially
      return <View></View>
    } else if (this.state.authStorage && !this.state.loggedIn || this.state.authStorage && !this.state.userSettings) {
      // if user auth data in storage, render home screen until auto logged in
      return this.renderHomeView();
    } else if (!this.state.loggedIn || !this.state.userSettings) {
      // if user data not in storage, render login screen
      return this.renderLoginView();
    } else if(!this.state.themeSelected) {
      // once logged in, render theme selection
      return this.renderThemeSelect();
    } else if (!this.state.matchState) {
      // render loading view while finding opponent
      return this.renderLoadingView();
    } else if(this.state.matchState){
      // render when match ready
      return this.renderMatchView();
    }
  },
  renderHomeView: function() {
    return (
      <HomeView />
    );
  },
  renderLoginView: function() {
   return (
     <LoginView email={this.state.email} username={this.state.username}
      password={this.state.password} loggedIn={this.state.loggedIn}
      loginAnimationFinished={this.state.loginAnimationFinished}/>
   );
  },
  renderThemeSelect: function() {
    return (
      <ThemeSelectView userSettings={this.state.userSettings} />
    );
  },
  renderLoadingView: function() {
    return (
      <LoadingView />
    );
  },
  renderMatchView: function() {
    return (
      <MatchView matchState={this.state.matchState} players={this.state.players} 
      themes={this.state.themes} uid={this.state.uid}/>
    );
  },
  _onChange: function() {
    this.setState(getState());
  }
});

AppRegistry.registerComponent('SPR', () => SPR);
AppRegistry.registerComponent('main', () => SPR);
