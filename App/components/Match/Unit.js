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

var Unit = React.createClass({
  getInitialState: function() {
    return {
      bounceValue: new Animated.Value(1),
    }
  },
  propTypes: {
    user: React.PropTypes.object,
    themes: React.PropTypes.object,
  },
  componentDidMount: function() {
  },
  componentDidUpdate: function(preProps) {
  },
  render: function() {
    var user = this.props.user;
    var uid = this.props.uid;
    var bounce = this.state.bounceValue;
    var themes = this.props.themes;
    var match = this.props.match;
    // find correct image
    var image;
    function changeUnit(type){
      image = {uri: themes[user.theme][type]};
    }
    
    if (user.id != uid) {
      if(match && match.state.stage == "prepare") {
        image = {uri: "http://i.imgur.com/nuwzwNF.jpg"}
      } else {
        changeUnit(this.props.user.unit.type);
      }
    } else {
      changeUnit(this.props.user.unit.type)
    }
    return (
        <TouchableHighlight underlayColor='transparent'
          onPress={() => this._changeUnitType(user.id, this.props.user.unit.type)}>
  
        <Animated.Image
          style={{width: 70, height: 70, borderRadius: 5, transform: [{scale: this.state.bounceValue}]}}
          source={image}
          />
        </TouchableHighlight>
    );
  },
  _changeUnitType: function(user, type) {
    // user changes unit type (disabled during battle stage)
    if(user == this.props.uid && this.props.match.state.stage == "prepare") {
      AppActions.toggleUnitType(user, type);
      // animate touch bounce
      var bounce = this.state.bounceValue;
      var newBounce = this.state.bounceValue._value;
      Animated.spring(
        bounce,
        {
          toValue: newBounce,
          friction: 3,
          velocity: 3,
        }
      ).start();
      } else {
        if(user == this.props.uid)  {
          
        } else {
        }
      }
    }
});

module.exports = Unit;