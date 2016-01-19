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

var GameSelect = React.createClass({
  propTypes: {
    game: React.PropTypes.string
  },
  render: function() {
    var game = this.props.game;
    var center = {alignItems: 'center', justifyContent: 'center'};
    var selectThemeStyle = {flex: 1, padding: 10, backgroundColor: "#f36e72", margin: 10}
    var animatedStyle = {opacity: this.props.opacity, transform: [{translateY: this.props.position}]}
    return (
      <Animated.View style={[animatedStyle, selectThemeStyle, center]}>
        <TouchableHighlight underlayColor={'rgba(0,0,0,0)'} onPress={() => this.props.choose(game)}>
          <Text style={{fontSize: 20}}>{game}</Text>
        </TouchableHighlight>
      </Animated.View>
    )
  }
});

module.exports = GameSelect;