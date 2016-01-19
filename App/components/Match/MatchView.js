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
var User = require('./User');

var MatchView = React.createClass({
  componentDidUpdate: function(prevProps){
    if(prevProps.matchState.timer != this.props.matchState.timer) {
      if(this.props.matchState.timer != 5) {
        this.FontAnim.setValue(this.FontAnim._value+1)
      }
    } else {
      if(prevProps.matchState.state.stage == "postbattle" && this.props.matchState.state.stage == "prepare") {
         this.FontAnim.setValue(this.FontAnim._value+1)
      }
    }
  },
  propTypes: {
    game: React.PropTypes.string
  },
  render: function() {
    this.FontAnim = new Animated.Value(15);
    var users = this.props.players.map((user) => {
      return <User user={user} key={user.id} ref={user.id} uid={this.props.uid} themes={this.props.themes} match={this.props.matchState}/>
    });
    if(this.props.matchState) {
      var topPlayer = this.props.matchState.state.topPlayer == this.props.uid ? users[0] : users[1];
      var bottomPlayer = this.props.matchState.state.bottomPlayer == this.props.uid ? users[0] : users[1];
      var topUser = this.props.matchState.state.topPlayer == this.props.uid ? this.props.players[0] : this.props.players[1];
      var bottomUser = this.props.matchState.state.bottomPlayer == this.props.uid ? this.props.players[0] : this.props.players[1];
    }
    var backStyle = this.props.matchState.state.stage == "prepare" ? styles.prepare : styles.battle;
    var layout = {flex: 1, justifyContent:  'space-around'}
    var center = {alignItems: 'center', justifyContent: 'center'};
    var stageStyle = {margin: 5};
    var margin = {marginTop: 100}
    var textMargin = {margin: 10, fontFamily: 'Helvetica'}
    var timer = this.props.matchState.state.stage == "prepare" ? this.props.matchState.timer: "BATTLE!";
    var timerStyle = {height: 25}
    var timerAnimStyle = {fontSize: this.FontAnim}
    return (
      <View displayName={"Game view"} style={[backStyle, layout]}>
        <View>
          <View style={[center, textMargin]}>
            <Text>{topUser.username}</Text>
          </View>
          <View style={[center]}>
            {topPlayer}
          </View>
          <View style={[center, textMargin]}>
            <Text>{this.props.matchState.state.topPlayerUnits}</Text>
          </View>
        </View>
      
        <View style={[center, timerStyle]}>
          <Animated.Text style={[timerAnimStyle]}>{timer}</Animated.Text>
        </View>
      
        <View>
          <View style={[center, textMargin]}>
            <Text>{this.props.matchState.state.bottomPlayerUnits}</Text>
          </View>
          <View style={[center]}>
            {bottomPlayer}
          </View>
          <View style={[center, textMargin]}>
            <Text>{bottomUser.username}</Text>
          </View>
        </View>
      <View>
      </View>

      </View>
    );
  }
});


var styles = StyleSheet.create({

// USER STYLES
  userContainer: {
    shadowColor: "#000000",
    shadowOpacity: 0.3,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 0
    },
  },
  thisUserContainer: {

  },
  thisUserRow: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    height: 100,
  },
  battle: {
    backgroundColor: '#FBE9E7'
  },
  prepare: {
    backgroundColor: '#E0F2F1',
  },
  userRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    height: 100
  },
  userDetails: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    backgroundColor: '#b2dfdb',
    height: 10
  },
  infoStyle: {
    fontSize: 12,
    padding: 2,
    flex: 1,
    alignSelf: 'flex-start',
  },
  
  
  
  
  
  
  row: {
    flex: 1,
    flexDirection: 'row'
  },
  column: {
    flex: 1,
    flexDirection: 'column'
  },
  title: {
    fontSize: 20,
    marginBottom: 8,
    textAlign: 'center',
    flex: 4,
  },
  thumbnail: {
    width: 100,
    height: 100,
  },
  ability: {
    width: 25,
    height: 34,
    flex: 1,
  },
  footerIcon: {
    width: 51.2,
    height: 51.2,
    flex: 3,
  },
  spacer3: {
    flex: 3,
  },
  spacer2: {
    flex: 2,
  },
  spacer1: {
    flex: 1,
  },
  spacerHalf: {
    flex: 0.5,
  },
  listView: {
    backgroundColor: '#fff',
  },
  bottom: {
    flex: 0.1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: "#000000",
    shadowOpacity: 0.3,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 0
    },
    height: 70
  },
});

module.exports = MatchView;