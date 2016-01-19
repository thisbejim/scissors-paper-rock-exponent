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

var ThemeSelectElement = React.createClass({
  propTypes: {
    theme: React.PropTypes.string
  },
  render: function() {
    var theme = this.props.theme;
    var center = {alignItems: 'center', justifyContent: 'center'};
    var selectThemeStyle = {width: 100, height: 100, borderRadius: 10, margin: 5, backgroundColor: "#f36e72", minWidth: 100}
    var animatedStyle = {opacity: this.props.opacity, transform: [{translateY: this.props.position}]}
    return (
      <Animated.View style={[animatedStyle, selectThemeStyle, center]}>
        <TouchableHighlight  underlayColor={'rgba(0,0,0,0)'} onPress={() => this.props.choose(theme)}>
          <Text style={{fontSize: 20}}>{theme}</Text>
        </TouchableHighlight>
      </Animated.View>
    )
  }
});

module.exports = ThemeSelectElement;