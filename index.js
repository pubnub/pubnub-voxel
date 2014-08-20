var createGame = require('voxel-engine')
var highlight = require('voxel-highlight')
var player = require('voxel-player')
var voxel = require('voxel')
var extend = require('extend')
var fly = require('voxel-fly')
var skin = require('minecraft-skin')
var walk = require('voxel-walk')

var a_player = function(game) {

  var createPlayer = player(game);
  return createPlayer('player.png')
}

module.exports = function(opts, setup) {
  setup = setup || defaultSetup
  var defaults = {
    generate: voxel.generator['Valley'],
    chunkDistance: 2,
    materials: [
      ['grass', 'dirt', 'grass_dirt']
    ],
    texturePath: '../textures/',
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
  var avatar = a_player(game);
  avatar.possess()
  avatar.yaw.position.set(2, 4, 4)

  var viking = a_player(game);
  viking.position.set(2, 4, 4)

  setup(game, avatar)
  
  return game
}

function defaultSetup(game, avatar) {
  
  var target = game.controls.target()
  
  // toggle between first and third person modes
  window.addEventListener('keydown', function (ev) {
    if (ev.keyCode === 'R'.charCodeAt(0)) avatar.toggle()
  })

  game.on('tick', function() {
    walk.render(target.playerSkin)
    var vx = Math.abs(target.velocity.x)
    var vz = Math.abs(target.velocity.z)
    if (vx > 0.001 || vz > 0.001) walk.stopWalking()
    else walk.startWalking()
  })

}
