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
var GameSelectElement = require('./GameSelectElement');

// ground work for potential user created games
var GameSelectView = React.createClass({
  componentDidUpdate: function(prevProps){
    if(!_.isEqual(prevProps.userSettings.savedGames, this.props.userSettings.savedGames)) {
      Animated.stagger(50, this._gamesAnimateIn(this.props.userSettings.savedGames)).start();
    }
  },
  propTypes: {
    game: React.PropTypes.string
  },
  render: function() {
    this.gameAnimations = {}
    this.props.userSettings.savedGames.forEach((game) => {
      this.gameAnimations[game] = {
        position: new Animated.Value(15),
        opacity: new Animated.Value(0)
      }
    });
    this.addGameAnim = new Animated.Value(0);
    
    var gameSelectWrapperStyle = {marginTop: 20};
    var containerStyle = {marginTop: 20}
    var boxStyle = {flex: 1, padding: 20, backgroundColor: "#f36e72", margin: 10}
    var center = {alignItems: 'center', justifyContent: 'center'};
    var inputStyle={height: 20, flex: 1, margin: 10}
    var touchStyle = {height: 20, flex: 1, margin: 10, backgroundColor: "#d6e1ef", borderRadius: 3}
    var inputWrapper = {opacity: this.addGameAnim, flexDirection: 'row', justifyContent: 'space-around'}
    if(!this.props.gameAnimationFinished) {
      Animated.sequence([
      Animated.stagger(50, this._gamesAnimateIn(this.props.userSettings.savedGames)),
      Animated.timing(
        this.addGameAnim,
          {toValue: 1}
      ),
      ]).start();
    }
    return (
      <View style={[containerStyle]}>
        <View style={[gameSelectWrapperStyle]}>
          {this._getGames(this.props.userSettings.savedGames)}
        </View>
        
        <Animated.View style={[inputWrapper]}>
          <TextInput displayName={"new game field"}
          style={[inputStyle]}
                autoCapitalize="none"
                placeholder="Create new game"
                returnKeyType={ 'done' }
                value={this.props.newUserGame}
                onChangeText={(game) => this._handleNewGameType(game)}
              />
            <TouchableHighlight style={[touchStyle, center]} onPress={this._createNewGame}>
            <Text>add</Text>
            </TouchableHighlight>

          </Animated.View>
      </View>
    )
  },
  _chooseGameAnim: function(game){
      Animated.stagger(50,
        this._gamesAnimateOut(this.props.userSettings.savedGames)).start(() => AppActions.selectGame(game));
  },
  _handleNewGameType: function(game){
    AppActions.handleNewUserGameType(game);
  },
  _createNewGame: function(){
    AppActions.createNewUserGame(this.props.newUserGame);
  },
  _getGames: function(games){
    return games.map((game) => {
      return <GameSelectElement game={game} position={this.gameAnimations[game].position} opacity={this.gameAnimations[game].opacity} choose={this._chooseGameAnim}/>
    });
  },
  _gamesAnimateIn: function(games){
    return games.map((game) => {
      return Animated.parallel([
        Animated.timing(
          this.gameAnimations[game].opacity,
          {toValue: 1},
        ),
        Animated.timing(
          this.gameAnimations[game].position,
          {toValue: 0},
        ),
      ])
    });
  },
  _gamesAnimateOut: function(games){
    return games.map((game) => {
      return Animated.parallel([
        Animated.timing(
          this.gameAnimations[game].opacity,
          {toValue: 0},
        ),
        Animated.timing(
          this.gameAnimations[game].position,
          {toValue: -15},
        ),
      ])
    });
  }
});
    
module.exports = GameSelectView;