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
  
// components
var Unit = require('./Unit');

var User = React.createClass({
  getInitialState: function() {
    return {
      position: new Animated.ValueXY(),
      scale: new Animated.Value(1),
      opacity: new Animated.Value(1),
      xpPositionYOne: new Animated.Value(0),
      xpPositionYTwo: new Animated.Value(0),
      xpPositionYThree: new Animated.Value(0),
      xpOpacityOne: new Animated.Value(1),
      xpOpacityTwo: new Animated.Value(1),
      xpOpacityThree: new Animated.Value(1),
    }
  },
  componentDidUpdate(prevprops){
    if(prevprops.user.progress.xp != this.props.user.progress.xp) {
      Animated.stagger(200,
          [
            Animated.timing(
            this.state.xpOpacityOne,
            {toValue: 4, duration: 2000}
            ),
            Animated.timing(
            this.state.xpOpacityTwo,
            {toValue: 4, duration: 2000}
            ),
            Animated.timing(
            this.state.xpOpacityThree,
            {toValue: 4, duration: 2000}
            )
      ]).start(() => {
        this.state.xpOpacityOne.setValue(1);
        this.state.xpOpacityTwo.setValue(1);
        this.state.xpOpacityThree.setValue(1);
      });
    }
  },
  propTypes: {
    user: React.PropTypes.object,
    uid: React.PropTypes.string,
    themes: React.PropTypes.object,
    match: React.PropTypes.object
  },
  render: function() {
    var user = this.props.user;
    var uid = this.props.uid;
    var animateStyle = {transform:[{translateY: this.state.position.y}, {scale: this.state.scale}, {translateX: this.state.position.x}], opacity: this.state.opacity}
    var animateXpIncreaseOne = {
      transform: [
      {
        translateY: this.state.xpOpacityOne.interpolate({
          inputRange: [1, 2, 3, 4],
          outputRange: [0, -40, -80, 0],
          extrapolate: 'clamp'})
      }],
        opacity: this.state.xpOpacityOne.interpolate({
          inputRange: [1, 2, 3, 4],
          outputRange: [0, 1, 0, 0],
          extrapolate: 'clamp'})
    }
    var animateXpIncreaseTwo = {
      transform: [
      {
        translateY: this.state.xpOpacityTwo.interpolate({
          inputRange: [1, 2, 3, 4],
          outputRange: [0, -40, -80, 0],
          extrapolate: 'clamp'})
      }],
        opacity: this.state.xpOpacityTwo.interpolate({
          inputRange: [1, 2, 3, 4],
          outputRange: [0, 1, 0, 0],
          extrapolate: 'clamp'}),
      marginLeft: 5
    }
    var animateXpIncreaseThree = {
      transform: [
      {
        translateY: this.state.xpOpacityThree.interpolate({
          inputRange: [1, 2, 3, 4],
          outputRange: [0, -40, -80, 0],
          extrapolate: 'clamp'})
      }],
        opacity: this.state.xpOpacityThree.interpolate({
          inputRange: [1, 2, 3, 4],
          outputRange: [0, 1, 0, 0],
          extrapolate: 'clamp'}),
      marginLeft: 10
    }
    var xpIncreaseStyle = {color: "#797979", fontWeight: "bold", height: 20, backgroundColor: 'rgba(0,0,0,0)', overflow: "visible"}
    var wrapperStyle = {flexDirection: 'column'}
    var xpIncreaseDisplayOne = "+"+Math.round((this.props.user.progress.xpIncrease / 2))
    var xpIncreaseDisplayTwo = "+"+Math.round((this.props.user.progress.xpIncrease / 5))
    var xpIncreaseDisplayThree = "+"+Math.round((this.props.user.progress.xpIncrease / 7))

    // helpers
    var transparent = {backgroundColor: 'rgba(0,0,0,0)'}
    var center = {alignItems: 'center', justifyContent: 'center'};
    // user based styles
    if(user.id == uid) {
    } else {

    }
    var height = Dimensions.get("window").height;
    var newMargin = height / 3;
    var margin = {marginTop: 100}
    var userNameStyle = {marginTop: 10}
    return (
      <Animated.View ref={user.id} key={user.id} style={[animateStyle]}>
          <Unit themes={this.props.themes} user={user} uid={uid} match={this.props.match}/>
          <Animated.Text style={[animateXpIncreaseOne, xpIncreaseStyle, center]}>
            {xpIncreaseDisplayOne}
          </Animated.Text>
          <Animated.Text style={[animateXpIncreaseTwo, xpIncreaseStyle, center]}>
            {xpIncreaseDisplayTwo}
          </Animated.Text>
          <Animated.Text style={[animateXpIncreaseThree, xpIncreaseStyle, center]}>
            {xpIncreaseDisplayThree}
          </Animated.Text>
      </Animated.View>
    );
  }
});

module.exports = User;