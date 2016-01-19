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

var LoginView = React.createClass({
  propTypes: {
    theme: React.PropTypes.string
  },
  render: function() {
     if(this.props.loggedIn && this.props.loginAnimationFinished) {
      this.loginAnimation = {opacity: new Animated.Value(1)}
      this._animateLoginView(0);
    } else if (!this.props.loginAnimationFinished) {
      this.loginAnimation = {opacity: new Animated.Value(0)}
      this._animateLoginView(1);
    }
    var textFieldStyle = {height: 50, flex:1}
    var textView = {height: 50, flex:1, borderBottomWidth: 1, borderBottomColor: "#cccccc", borderBottomWidth: 1}
    var center = {alignItems: 'center', justifyContent: 'center'};
    var buttonStyle = {borderRadius: 8, height: 50, width: 80, backgroundColor: '#d6e1ef'}
    var textStyle = {backgroundColor: 'rgba(0,0,0,0)', fontSize: 20}
    var wrapperStyle={opacity: this.loginAnimation.opacity, marginTop: 30, borderStyle:"solid", borderColor:"#cccccc", borderTopWidth: 1, borderBottomWidth: 1}
    return (
    <Animated.View displayName={"Login view"} style={[wrapperStyle]}>
        <View style={{flexDirection: 'row'}}>
            <View style={{margin: 5, padding: 5, height: 40, width: 40}}>
              <Image style={{height: 30, width: 30}} source={{uri: "http://i.imgur.com/YL3tF0n.png"}} />
            </View>
            <View style={[textView]}>
              <TextInput displayName={"Username field"}
                style={[textFieldStyle]}
                autoCapitalize="none"
                placeholder="Username"
                value={this.props.username}
                onChangeText={(username) => this._username(username)}
              />
            </View>
        </View>
  
        <View style={{flexDirection: 'row'}}>
            <View style={{margin: 5, padding: 5, height: 40, width: 40}}>
              <Image style={{height: 30, width: 30}} source={{uri: "http://i.imgur.com/GAY5tLp.png"}} />
            </View>
            <View style={[textView]}>
              <TextInput displayName={"Email field"}
                style={[textFieldStyle]}
                autoCapitalize="none"
                placeholder="Email"
                keyboardType='email-address'
                value={this.props.email}
                onChangeText={(email) => this._email(email)}
              />
            </View>
        </View>
            <View style={{flexDirection: 'row'}}>
            <View style={{margin: 5, padding: 5, height: 40, width: 40}}>
              <Image style={{height: 30, width: 30}} source={{uri: "http://i.imgur.com/Z8Dz9J0.png"}} />
            </View>

              <TextInput displayName={"Password field"}
                style={[textFieldStyle]}
                autoCapitalize="none"
                placeholder="Password"
                returnKeyType={ 'done' }
                value={this.props.password}
                password={true}
                onChangeText={(pass) => this._pass(pass)}
              />

        </View>
        {/* login/register needs to be placed above the keyboard */}
        <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
          <TouchableHighlight style={[buttonStyle, center]} onPress={this._login}>
          <Text style={[textStyle]} >login</Text>
          </TouchableHighlight>
          <TouchableHighlight style={[buttonStyle,center]} onPress={this._register}>
          <Text style={[textStyle]}>register</Text>
          </TouchableHighlight>
          <Text>{this.props.loginError}</Text>
        </View>
      </Animated.View>
    );
  },
  _animateLoginView: function(value){
    Animated.timing(
          this.loginAnimation.opacity,
          {toValue: value},
        ).start(()=> AppActions.loginAnimationFinished());
  },
  _email: function(email) {
    AppActions.handleEmail(email);
  },
  _pass: function(pass) {
    AppActions.handlePassword(pass);
  },
  _username: function(username) {
    AppActions.handleUsername(username);
  },
  _login: function() {
    AppActions.login(this.props.email, this.props.password);
  },
  _logout: function() {
    AppActions.logout();
  },
  _register: function() {
    AppActions.register(this.props.email, this.props.password, this.props.username);
  },
});

module.exports = LoginView;