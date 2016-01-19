// Essentials
var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;
var CHANGE_EVENT = 'change';

// App
var React = require('react-native');
var AppConstants = require('../constants/AppConstants');
var AppDispatcher = require('../dispatcher/AppDispatcher');

var {
  AppRegistry,
  AsyncStorage,
  LayoutAnimation,
  Animated,
  Image,
  ListView,
  StyleSheet,
  Text,
  View,
} = React;

var STORAGE_EMAIL = '@AsyncStorageExample:email';
var STORAGE_PASSWORD = '@AsyncStorageExample:password';
var STORAGE_USERNAME = '@AsyncStorageExample:username';
// Additions
var Firebase = require('firebase');
var _ = require('underscore');

// STATES

// for global and private games e.g., /global or /custom
var game = "global";

// startup
var authStorageChecked = false;
var authStorage = false;
var loaded = false;
var loggedIn = false;
var leaderboard = new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2,});

// options
var LogRegSelect = "Login";
var themes = {
  "medieval": {
    0: "http://i.imgur.com/l85rPOt.jpg",
    1: "http://i.imgur.com/nVvNg9W.jpg",
    2: "http://i.imgur.com/sdKhUXj.jpg",
  },
  "nyan":{
    0: "http://49.media.tumblr.com/tumblr_lrbu1l9BJk1qgzxcao1_250.gif",
    1: "http://49.media.tumblr.com/tumblr_lrbu1l9BJk1qgzxcao1_250.gif",
    2: "http://49.media.tumblr.com/tumblr_lrbu1l9BJk1qgzxcao1_250.gif",
  }
}
var themeSelected = false;
var newUserGame = "";

// animation
var loginAnimationFinished = false;

// User
var username;
var email;
var password;
var uid;
var userSettings;

// match
var matchState;
var players = []

// timers (for global clearInterval)
var timers = {};

// logging
var logRef;

// animation data
var refs;

// errors
var loginError;

// Firebase Configuration
var ref = new Firebase("https://leaderboardapp.firebaseio.com/");

// inital login
AsyncStorage.getItem(STORAGE_EMAIL).then((storageEmail) => {
  console.log("Got email: "+storageEmail);
  AsyncStorage.getItem(STORAGE_PASSWORD).then((storagePass) => {
    console.log("Got password: "+storagePass);
    AsyncStorage.getItem(STORAGE_USERNAME).then((storageUsername) => {
      console.log("Got username: "+storageUsername);
      email = storageEmail;
      password = storagePass;
      username = storageUsername;
      if(email && password){
        authStorage = true;
        login(email, password);
      } else {
        authStorage = false;
      }
      authStorageChecked = true;
      AppStore.emitChange();
    });
  });
}).catch((error) => { console.log('AsyncStorage error: ' + error.message) })
  .done();

// Dispatch functions

function runMatch(topPlayer, bottomPlayer) {
  // define refs
  var matchId = topPlayer+bottomPlayer;
  logRef.push({"log": "running match: "+matchId});
  var matchRef = ref.child(game).child('online').child(uid).child("currentMatch").child(matchId);
  var matchTimerRef = matchRef.child("timer");
  var matchStateRef = matchRef.child("state");
  var matchStageRef = matchRef.child("state").child("stage");
  var opponentId = topPlayer != uid ? topPlayer : bottomPlayer;
  var opponentRef = ref.child(game).child("online").child(opponentId);
  var opponentmatchStateRef = opponentRef.child("currentMatch").child(matchId).child("state").child("stage");
  var opponent;
  var timerFinished = false;
  // get opponent data
  opponentRef.on("value", function(data) {
    players[1] = data.val();
    AppStore.emitChange();
  });
  
  // get match data
  matchRef.on("value", (data) => {
    matchState = data.val();
    if(players[1]) {
      AppStore.emitChange();
    }
  });
  
  function shouldStartMatchTimer() {
    if(!timerFinished) {
      var waitForAnim = setInterval(function() {
        clearInterval(waitForAnim);
        matchRef.child("state").update({"stage": "postbattle"}, (error) => {
          opponentmatchStateRef.on("value", (data) => {
            if(data.val() == "postbattle") {
              opponentmatchStateRef.off("value");
              matchRef.child("state").update({"stage": "prepare"}, (error) => {
                startTimer();
              });
            }
          });
        });
      }, 3000);
    }
  }
  // start match timer
  function startTimer() {
    timers[matchId] = setInterval(function() {
      matchTimerRef.once("value", function(data){
        var newTimer = data.val()
        newTimer--;
        matchRef.update({"timer": newTimer});
      })
    }, 1000);
  }
  startTimer();
  // update game stage e.g. battle or prepare
  matchTimerRef.on("value", function(timeData) {
    if(timeData.val() == 0) {
      clearInterval(timers[matchId]);
      matchRef.update({"timer": 5});
      matchStageRef.once("value", function(stageData) {
        if(stageData.val() == "prepare") {
          matchRef.child("state").update({"stage": "battle"}, (error) => {
            if(error){
            } else {
              // check opponent on same page
              opponentmatchStateRef.on("value", (data) => {
                if(data.val() == "battle") {
                  // got to pause the timer so that this user doesn't keep changing stages
                  opponentmatchStateRef.off("value");
                  battle();
                }
              });
            }
          });
        }
      });
    }
  });

  // set game state,
  matchStateRef.on("value", function(data) {
    matchStateData = data.val();
    if (matchStateData.topPlayerUnits == 0 || matchStateData.bottomPlayerUnits == 0) {
      // close all connections
      timerFinished = true;
      clearInterval(timers[matchId]);
      matchRef.off('value');
      matchTimerRef.off('value');
      matchStateRef.off('value');
      matchStageRef.off('value');
      opponentRef.off('value');
      // update winner
      var winner = matchStateData.topPlayerUnits == 0 ? bottomPlayer : topPlayer;
      var loser = matchStateData.topPlayerUnits == 0 ? topPlayer : bottomPlayer;
      logRef.push({"log": "Winner for "+matchId+" is "+winner});
      matchRef.child("state").update({"winner": winner});
      var opponentMatchRef = ref.child(game).child("online").child(opponentId).child("currentMatch").child(matchId).child("state");
      opponentMatchRef.on("value", function(resultData) {
        var results = resultData.val();
          if(results.winner == "undefined"){
            logRef.push({"log": "Waiting for opponent to update winner for match: "+matchId});
          } else if(results.winner == winner) {
            opponentMatchRef.off('value');
            closeMatch(matchState, matchId, winner, loser);
          } else {
            closeMatch(matchState, matchId, "cheater", null);
          }
      });
    }
  });
  
  // handle battle stage
  function battle() {
    var match = matchState;
    var opponent = players[1];
    var opponentScore = topPlayer != uid ? match.state.topPlayerUnits : match.state.bottomPlayerUnits;
    var playerScore = topPlayer != uid ? match.state.bottomPlayerUnits : match.state.topPlayerUnits;
    var opponentUnits = topPlayer != uid ? "topPlayerUnits" : "bottomPlayerUnits";
    var playerUnits = topPlayer != uid ? "bottomPlayerUnits" : "topPlayerUnits";
    var playerUnitNum = topPlayer != uid ? 1: 2;
    var oponnentUnitNum = topPlayer != uid ? 2: 1;
    // rock paper scissor matrix
    var rules = {
      0: {
        "defeats": 1, "loses": 2
      },
      1: {
        "defeats": 2, "loses": 0
      },
      2: {
        "defeats": 0, "loses": 1
      }
    }
    // check unit types and win/lose scenarios
    var opponentUnitType = players[1].unit.type;
    var userUnitType = players[0].unit.type;
    if (rules[opponentUnitType].defeats == userUnitType) {
      ref.child(game).child("online").child(uid).child("currentMatch").child(matchId).child("state").update({[playerUnits]: playerScore -= 1}, () => {
        handleXp(opponentId);
      });
    } else if (rules[opponentUnitType].loses == userUnitType) {
      ref.child(game).child("online").child(uid).child("currentMatch").child(matchId).child("state").update({[opponentUnits]: opponentScore -= 1}, ()=> {
        shouldStartMatchTimer();
      });
    } else {
      shouldStartMatchTimer();
    }
  }
  
  function handleXp(userId) {
    ref.child(game).child("online").child(userId).child("progress").once("value", (data) => {
      var progress = data.val();
      var additionalXp = ((Math.random() * (5 - 3) + 3) / 100) * progress.levelUp;
      var newXp = progress.xp + additionalXp;
      if(progress.levelUp <= newXp) {
        var newLevel = progress.level + 1;
        var newLevelUp = progress.levelUp * 1.2;
        var updatedProgressData = {};
        updatedProgressData["/progress/level/"] = newLevel;
        updatedProgressData["/progress/levelUp/"] = newLevelUp;
        updatedProgressData["/progress/xp/"] = newXp;
        updatedProgressData["/progress/xpIncrease/"] = additionalXp;
        ref.child(game).child("online").child(userId).update(updatedProgressData, () => {
          shouldStartMatchTimer();
        });
      } else {
        var updatedProgressData = {};
        updatedProgressData["/progress/xp/"] = newXp;
        updatedProgressData["/progress/xpIncrease/"] = additionalXp;
        ref.child(game).child("online").child(userId).update(updatedProgressData, () => {
          shouldStartMatchTimer();
        });
      }
    });
  }
}




function stopMatchListeners(matchId, opponent) {
  clearInterval(timers[matchId]);
  delete timers[matchId];
  var matchRef = ref.child(game).child('online').child(uid).child("currentMatch").child(matchId);
  matchRef.off("value");
  matchRef.child("timer").off("value");
  matchRef.child("state").off("value");
  matchRef.child("state").child("stage").off("value");
  ref.child(game).child("online").child(opponent).off("value");
}

function deleteMatch(matchData, matchId, opponent) {
  if(matchData.state.bottomPlayer == uid) {
    topMatch = undefined;
    topOpponent = undefined;
  } else {
    bottomMatch = undefined;
    bottomOpponent = undefined;
  }
}

function copyFinishedMatch(matchData, matchId, winner, opponent) {
  if(uid == matchData.state.topPlayer) {
    var matchUpdateRef = ref.child(game).child("finishedMatches");
    var date = new Date().getTime();
    matchUpdateRef.push({
      players: matchData.info.players,
      topPlayer: matchData.state.topPlayer,
      bottomPlayer: matchData.state.bottomPlayer,
      winner: winner,
      timeStarted: matchData.info.time,
      timeEnded: date,
    }, function(error){
      if(error) {
        logRef.push({"error": error});
      } else {
      }
    });
  }
}

function discardMatch(matchId, opponent, acceptMatchesType) {
  discard = () => {}
  logRef.push({"log": "Discarding: "+matchId});
  var discardMatchRef = ref.child(game).child("online").child(uid).child("currentMatch").child(matchId);
  discardMatchRef.on("value", (data) => {
    logRef.push({"log": "Discarding 2: "+matchId});
    if(data.val() && timers[matchId]) {
      logRef.push({"log": "Discarding 3: "+matchId});
      discardMatchRef.off("value");
      stopMatchListeners(matchId, opponent);
      deleteMatch(data.val(), matchId, opponent);
      var updatedMatchData = {};
      updatedMatchData[uid+"/currentMatch/" + matchId] = null;
      updatedMatchData[uid+"/opponentRanks/" + opponent] = null;
      ref.child(game).child("online").update(updatedMatchData, function(error) {
        if(error) {
          logRef.push({"log": "Discarding 4: "+matchId});
        } else {
          logRef.push({"log": "Discarding 5: "+matchId});
          ref.child(game).child("online").child(opponent).child("currentMatch").child(matchId).on("value", (data) => {
            logRef.push({"log": "Discarding 6: "+matchId});
            if(!data.val()) {
              logRef.push({"log": "Finished discarding: "+matchId});
              ref.child(game).child("online").child(opponent).child("currentMatch").child(matchId).off("value");
              ref.child(game).child("online").child(uid).update({[acceptMatchesType]: true});
              discard = testClose;
            }
          });
        }
      });
    }
  })
}

function closeMatch(matchData, matchId, winner, loser) {
  var opponent = uid == matchData.state.topPlayer ? matchData.state.bottomPlayer : matchData.state.topPlayer;
  if(winner == "discarded" || winner == "cheater" ) {
    discardMatch(matchId, opponent, acceptMatchesType)
  } else {
    stopMatchListeners(matchId, opponent);
    deleteMatch(matchData, matchId, opponent);
    // delete match
    var updatedMatchData = {};
    updatedMatchData[uid+"/currentMatch/"+matchId] = null;
    updatedMatchData[uid+"/currentOpponent"] = null;
    var opponentMatchRef = ref.child(game).child("online").child(opponent).child("currentMatch").child(matchId);
    ref.child(game).child("online").update(updatedMatchData, () => {
    copyFinishedMatch(matchData, matchId, winner, opponent);
    opponentMatchRef.on("value", (data) => {
      if(!data.val()) {
        matchState = null;
        AppStore.emitChange();
        players.splice(1, 1);
        ref.child(game).child("online").child(uid).update({"inMatch": false}, ()=> {
          matchSearch();
        });
      }
    });
  });
  }
}


function newMatch(player1, player2) {
  var date = new Date().getTime();
  var matchRef = ref.child(game).child('online').child(uid).child("currentMatch").child(player1.id+player2.id);
  matchRef.set({
    info: {
      time: date,
      players: [player1.id, player2.id],
    },
    state: {
      stage: "prepare",
      topPlayerUnits: 5,
      bottomPlayerUnits: 5,
      winner: "undefined",
      topPlayer: player1.id,
      bottomPlayer: player2.id,
    },
    timer: 5,
  },
  function(error) {
    if(error) {
      logRef.push({"error": error});
    } else {
      // handle disconnect
      //ref.child(game).child("online").child(player1).child("currentMatches").child(matchRef.key()).onDisconnect().remove();
      // opponent rank for security rules
      var opponent = player1.id == uid ? player2 : player1;
      ref.child(game).child('online').child(uid).update({"currentOpponent": opponent.id});
      // check both players have written match data
      var checkOpponentMatch = ref.child(game).child('online').child(opponent.id).child("currentMatch").child(player1.id+player2.id);
      checkOpponentMatch.on("value", (opponentMatchData) => {
        if(opponentMatchData.val()) {
          checkOpponentMatch.off("value");
          runMatch(player1.id, player2.id);
        }
      });
    }
  });
}

function matchTransaction(player1, player2) {
  var transactionRef = ref.child(game).child('matchTransactions').child(player1.id+player2.id);
  transactionRef.update({[uid]: true}, function(error) {
    if(error) {
      logRef.push({"error": error});
    }
  });
  transactionRef.on("value", (data) => {
    if(data.val()[player1.id] && data.val()[player2.id]) {
      transactionRef.off("value");
      transactionRef.remove();
      ref.child(game).child('online').child(uid).update({"inMatch": true}, (error) => {
        newMatch(player1, player2);
      });
    }
  });
}

function sortOpponents(opponents) {
  if(_.size(opponents) > 1) {
    // sort by win ratio
    var potentialOpponents = _.sortBy(opponents, (opponent) => {return opponent.progress.ratio});
    // find user index in sort
    var userIndex =_.findIndex(potentialOpponents, {id: uid});
    // get closest opponent by level and ratio
    var opponent = potentialOpponents[userIndex-1] ? potentialOpponents[userIndex-1] : potentialOpponents[userIndex+1];
    // if chosen opponent already in match, ditch opponent and retry
    if(opponent.inMatch) {
      potentialOpponents = _.filter(potentialOpponents, {id: opponent.id});
      sortOpponents(potentialOpponents);
    } else {
      return opponent
    }
  } else {
    // all opponents in matches
    return false
  }
}

function getOpponent(level) {
  var start = level - 5;
  var end = level + 5;
  var opponentRef = ref.child(game).child("online").orderByChild("progress/level").startAt(start).endAt(end).once("value", (data) => {
    if(!data.val()) {
      // no players available
      console.log("no players available")
      matchSearch();
    } else {
      // find fitting opponent by level and win ratio
      console.log("all potential players in matches")
      var opponent = sortOpponents(data.val());
      if(opponent) {
        console.log(opponent)
        if(opponent.progress.xp > players[0].progress.xp){
          matchTransaction(opponent, players[0]);
        } else if(opponent.progress.xp < players[0].progress.xp) {
           matchTransaction(players[0], opponent);
        } else if(opponent.joined > players[0].joined) {
          matchTransaction(opponent, players[0]);
        } else if (opponent.joined < players[0].joined){
          matchTransaction(players[0], opponent);
        }
      } else {
        // all potential players in matches
        console.log("all potential players in matches");
        matchSearch();
      }
    }
  });
}

function matchSearch() {
  var userRef = ref.child(game).child("online").child(uid);
  userRef.once("value", (data) => {
    var user = data.val();
    if(!user.inMatch) {
      getOpponent(user.progress.level);
    }
  });
}

function monitorUser() {
  loaded = true;
  ref.child(game).child('online').child(uid).on("value", (data) => {
    players[0] = data.val();
    AppStore.emitChange();
  });
}

function connectToGame() {
  // grab user data
  ref.child(game).child('users').child(uid).once("value", function(data) {
    var userInfo = data.val();
    // add to online users
    ref.child(game).child("online").child(uid).update(userInfo, function(error) {
      if (error) {
        console.log("Data could not be saved." + error);
      } else {
        // begin initial data loading
        monitorUser();
        matchSearch();
      }
    });
  });
}

function startGameConnection() {
  ref.child(game).child('users').child(uid).once("value", function(data) {
    if(!data.val()) {
      ref.child(game).child("userNum").once("value", function(numberOfUsers) {
        var userNum = numberOfUsers.val();
        var date = new Date().getTime();
        if(userNum){
          userNum++
        } else {
          userNum = 1;
        }
        // create new user information
        ref.child(game).child('users').child(uid).update({
          username: username,
          id: uid,
          unit: {
            type: 0,
            active: false,
            played: false,
          },
          inMatch: false,
          progress: {
            level: 1,
            levelUp: 100,
            xp: 0,
            xpIncrease: 0,
            ratio: 0,
            ratioPoints: 0,
          },
          savedGames: "global",
          joined: date,
        },
        function(error) {
          if (error) {
            console.log("Data could not be saved." + error);
          } else {
            ref.child(game).child("userNum").set(userNum);
            connectToGame();
          }
        });
      });
    } else {
      connectToGame();
    }
  });
}

function getUserSettings(username, id) {
  ref.child("users").child(id).on("value", (data) => {
   if(!data.val()) {
    ref.child("users").child(id).update({
      username: username,
      id: uid,
      unlockedThemes: ["medieval"],
      savedGames: ["global"]
    });
   } else {
    userSettings = data.val();
    AppStore.emitChange();
   }
  });
}

// TODO: possibly remove the ability to add an email and pass and simply generate a random one or something (less friction) from username
function register(email, password, username) {
  Firebase.goOnline();
  ref.createUser({
    email: email,
    password: password
  },
  function(error, userData) {
    if (error) {
      console.log("Error creating user:", error);
      loginError = String(error);
      AppStore.emitChange();
    } else {
      // log new user in
      AsyncStorage.setItem(STORAGE_EMAIL, email);
      AsyncStorage.setItem(STORAGE_PASSWORD, password);
      AsyncStorage.setItem(STORAGE_USERNAME, username);
      login(email, password);
    }
  });
}

//Firebase.enableLogging(true);
//Firebase.enableLogging(function(logMessage) {
//  loginError += logMessage+'\n';
//  //AppStore.emitChange();
//});

function login(email, password) {
  // current supported exponenjs react native has issues with websockets and is causing firebase to delay login
  AppStore.emitChange();
  Firebase.goOnline();
  ref.authWithPassword({
    email: email,
    password: password
  },
  function(error, authData) {
    if (error) {
      loginError = "error"
      AppStore.emitChange();
    } else {
      // set state
      uid = authData.uid;
      logRef = ref.child(game).child("logs").child(uid);
      loggedIn = true;
      AppStore.emitChange();
      // save login data to local storage
      AsyncStorage.setItem(STORAGE_EMAIL, email);
      AsyncStorage.setItem(STORAGE_PASSWORD, password);
      AsyncStorage.setItem(STORAGE_USERNAME, username);
      getUserSettings(username, uid);
    }
  });
}

function logout() {
  AsyncStorage.removeItem(STORAGE_EMAIL).then(() => {
    AsyncStorage.removeItem(STORAGE_PASSWORD).then(() => {
      AsyncStorage.removeItem(STORAGE_USERNAME).then(() => {
        ref.child(game).child('users').child(uid).update(user);
        ref.child(game).child('online').child(uid).remove();
        // TODO store all firebase reference to call .off() on, otherwise when we logout then logon they all start again.
        ref.unauth();
        Firebase.goOffline();
        loggedIn = false;
        loaded = false;
        uid = undefined;
        user = undefined;
        username = undefined;
        password = undefined;
        email = undefined;
        loginError = undefined;
        game = undefined;
        leaderboard = leaderboard.cloneWithRows({});
        AppStore.emitChange();
      });
    });
  });
}


// State functions
var AppStore = assign({}, EventEmitter.prototype, {
  getState: function() {
    return {
      email: email,
      password: password,
      username: username,
      LogRegSelect: LogRegSelect,
      loggedIn: loggedIn,
      authStorageChecked: authStorageChecked,
      authStorage: authStorage,
      loaded: loaded,
      leaderboard: leaderboard,
      loginError: loginError,
      uid: uid,
      game: game,
      matchState: matchState,
      themes: themes,
      players: players,
      userSettings: userSettings,
      themeSelected: themeSelected,
      loginAnimationFinished: loginAnimationFinished,
    }
  },
  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },
  checkAuth: function() {
//    AsyncStorage.getItem(STORAGE_EMAIL).then((email) => {
//      AsyncStorage.getItem(STORAGE_PASSWORD).then((pass) => {
//        login(email, pass);
//      });
//    }).catch((error) => { console.log('AsyncStorage error: ' + error.message) })
//      .done();
  }
});

// Dispatcher
AppDispatcher.register(function(action) {
  switch(action.actionType) {
    // Main component
    case AppConstants.HANDLE_EMAIL:
      email = action.data;
      AppStore.emitChange();
      break;
    case AppConstants.HANDLE_PASSWORD:
      password = action.data;
      AppStore.emitChange();
      break;
    case AppConstants.HANDLE_USERNAME:
      username = action.data;
      AppStore.emitChange();
      break;
    case AppConstants.HANDLE_LOGIN_SELECT:
      LogRegSelect = LogRegSelect == "Login" ? "Register" : "Login";
      AppStore.emitChange();
      break;
    case AppConstants.LOGIN:
      login(action.email, action.password);
      AppStore.emitChange();
      break;
    case AppConstants.LOGOUT:
      logout();
      AppStore.emitChange();
      break;
    case AppConstants.REGISTER:
      register(action.email, action.password, action.username);
      AppStore.emitChange();
      break;
    case AppConstants.SELECT_THEME:
      ref.child(game).child("online").child(uid).child("theme").set(action.theme);
      themeSelected = true;
      AppStore.emitChange();
      startGameConnection();
      break;
    case AppConstants.INITIAL_LOAD:
      loaded = true;
      AppStore.emitChange();
      break;

    // User component
    case AppConstants.TOGGLE_UNIT_ACTIVE:
      var unitRef= ref.child(game).child("online").child(action.user).child("unit").child("active");
      unitRef.set(action.active);
      AppStore.emitChange();
      break;
    case AppConstants.TOGGLE_UNIT_TYPE:
      var newType = action.type === 2 ? 0 : action.type + 1;
      var unitRef= ref.child(game).child("online").child(action.user).child("unit").update({"type": newType});
      AppStore.emitChange();
      break;
    case AppConstants.LOGIN_ANIM_FINISHED:
      loginAnimationFinished = true;
      AppStore.emitChange();
      break;
    case AppConstants.NEW_USER_GAME_TYPE:
      newUserGame = action.game;
      gameAnimationFinished = true;
      AppStore.emitChange();
      break;
    case AppConstants.NEW_USER_GAME:
      var newSavedGame = userSettings.savedGames.slice();
      newSavedGame.push(action.game);
      ref.child("users").child(uid).child("savedGames").set(newSavedGame)
      AppStore.emitChange();
      break;
    default:
  }
});

module.exports = AppStore;