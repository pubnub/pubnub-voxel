var createGame = require('voxel-engine')
var highlight = require('voxel-highlight')
var player = require('voxel-player')
var voxel = require('voxel')
var extend = require('extend')
var fly = require('voxel-fly')
var skin = require('minecraft-skin')
var walk = require('voxel-walk')
var uuid = window.PUBNUB.uuid();
var pubnub = window.PUBNUB.init({
  publish_key: 'demo',
  subscribe_key: 'demo',
  uuid: uuid
});

var channel = 'pubnub-voxel';

module.exports = function(opts, setup) {
  setup = setup || false;
  var defaults = {
    generate: voxel.generator['Valley'],
    chunkDistance: 2,
    materials: [
      ['grass', 'dirt', 'grass_dirt']
    ],
    texturePath: './textures/',
    worldOrigin: [0, 0, 0],
    controls: { discreteFire: true }
  }
  opts = extend({}, defaults, opts || {})

  // setup the game 
  var game = createGame(opts)
  var container = opts.container || document.body
  window.game = game // for debugging
  game.appendTo(container)
  if (game.notCapable()) return game
  

  // create the player from a minecraft skin file and tell the
  // game to use it as the main player
  var createPlayer = player(game);

  var Users = {};
  var User = function(uuid) {
    
    var self = {};

    self.avatar = createPlayer('player.png');

    self.avatar.position.set(2, 4, 4)

    Users[uuid] = self;

    return self;

  }

  pubnub.subscribe({
    channel: channel,
    callback: function(data) {
      if(data.uuid !== self.uuid) {
        console.log('got user pos')
        Users[data.uuid].avatar.position.set(data.position.x, data.position.y, data.position.z);
      } 
    },
    presence: function(data) {
      if(data.action == "join" && typeof Users[data.uuid] == "undefined") {
        console.log('user join')
        new User(data.uuid);
      }
      if(data.action == "leave") {
        delete Users[data.uuid];
      }
    }
  });

  var self = new User(uuid);

  self.avatar.possess()
  self.avatar.yaw.position.set(2, 4, 4)

  // var viking = new User();
  // viking.position.set(2, 4, 4)
  
  // toggle between first and third person modes
  window.addEventListener('keydown', function (ev) {
  
    if (ev.keyCode === 'R'.charCodeAt(0)) self.avatar.toggle()

  });

  setInterval(function(){

    pubnub.publish({
      channel: channel,        
      message: {
        uuid: uuid,
        position: self.avatar.position
      }
    });

  }, 250);

  game.on('tick', function() {

    walk.render(self.avatar.playerSkin)
    var vx = Math.abs(self.avatar.velocity.x)
    var vz = Math.abs(self.avatar.velocity.z)
    if (vx > 0.001 || vz > 0.001) walk.stopWalking()
    else walk.startWalking()

  })

  return game
}
