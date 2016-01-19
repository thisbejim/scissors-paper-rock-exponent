var React = require('react-native');
var _ = require('underscore');
var AppActions = require('../../actions/AppActions');
var AppStore = require('../../stores/AppStore');
var {
  Image,
  Animated,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  TextInput,
} = React;
  
// components
var ThemeSelectElement = require('./ThemeSelectElement');

var ThemeSelectView = React.createClass({
  propTypes: {
    theme: React.PropTypes.string
  },
  render: function() {
    this.themeAnimations = {}
    // add animated values
    this.props.userSettings.unlockedThemes.forEach((theme) => {
      this.themeAnimations[theme] = {
        position: new Animated.Value(15),
        opacity: new Animated.Value(0)
      }
    });
    var availableThemes = this._getThemes(this.props.userSettings.unlockedThemes);
    // add ghost selections to align content to the left
    while(availableThemes.length % 3 != 0) {
      availableThemes.push(
        <View style={{width: 100, height: 100, margin: 5}}></View>
      )
    }
    var themeSelectWrapperStyle = {marginTop: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around'};
    var containerStyle = {marginTop: 20}
    Animated.stagger(50, this._themesAnimateIn(this.props.userSettings.unlockedThemes)).start();
    return (
      <View style={[containerStyle]}>
      <TouchableHighlight onPress={this._logout}>
      <Text>logout</Text>
      </TouchableHighlight>
        <View style={[themeSelectWrapperStyle]}>
          {availableThemes}
        </View>
      </View>
    );
  },
  _getThemes: function(themes){
    return themes.map((theme) => {
      return <ThemeSelectElement theme={theme} opacity={this.themeAnimations[theme].opacity} position={this.themeAnimations[theme].position} choose={this._chooseThemeAnim}/>
    });
  },
  _themesAnimateIn: function(themes){
    return themes.map((theme) => {
      return Animated.parallel([
        Animated.timing(
          this.themeAnimations[theme].opacity,
          {toValue: 1}
        ),
        Animated.timing(
          this.themeAnimations[theme].position,
          {toValue: 0}
        ),
      ])
    });
  },
  _themesAnimateOut: function(themes){
    return themes.map((theme) => {
      return Animated.parallel([
        Animated.timing(
          this.themeAnimations[theme].opacity,
          {toValue: 0}
        ),
        Animated.timing(
          this.themeAnimations[theme].position,
          {toValue: -15}
        ),
      ])
    });
  },
   _chooseThemeAnim: function(theme){
     Animated.stagger(50,
      this._themesAnimateOut(this.props.userSettings.unlockedThemes)).start(() => AppActions.selectTheme(theme));
  },
  _logout: function() {
    AppActions.logout();
  },
});

module.exports = ThemeSelectView;