var React = require('react-native');
var _ = require('underscore');
var AppActions = require('../actions/AppActions');
var AppStore = require('../stores/AppStore');
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

var HomeView = React.createClass({
  render: function(){
    return(
      <View>
        <Text style={{marginTop: 50}}> Home Screen </Text>
      </View>
    );
  }
});

module.exports = HomeView;