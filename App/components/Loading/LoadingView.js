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
  Dimensions
} = React;

var LoadingView = React.createClass({
  render: function() {
    return (
      <View displayName={"Loading view"} style={{marginTop: 30}}>
        <Text>
          Loading users...
        </Text>
      </View>
    );
  }
});

module.exports = LoadingView;