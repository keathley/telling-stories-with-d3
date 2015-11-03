import {Socket} from "phoenix"
import $ from 'jquery'
import ace from 'brace'
import 'brace/mode/javascript'
import 'brace/theme/github'

require('css/app')

window.$ = $

const Editor = (() => {
  var editor = null;

  function create() {
    editor = ace.edit('editor')
    editor.getSession().setMode('ace/mode/javascript')
    editor.setTheme('ace/theme/github')
  }

  function toggle() {
    $('body').toggleClass('editor-open')
  }

  return {
    new: create,
    toggle: toggle
  }
})();

const Router = (() => {
  function navigate(path) {
    var newPath = path ? path : ''
      , root    = window.location.href.replace(/#(.*)$/, '')
      , newRoute = `${root}#/${newPath}`

    window.location.href = newRoute

    return this
  }

  function path() {
    return (window.location.href.match(/^(.*)\/#\/(.*)$/)||['','','0'])[2]
  }

  return {
    navigate: navigate,
    path: path
  }
})();

const Deck = (() => {
  var $slides       = $('.slide')
    , currentSlide = null

  $(window).on('hashchange', _updateCurrentSlide)

  _updateCurrentSlide()

  function next() {
    if ( currentSlide < $slides.length-1 )
      Router.navigate(currentSlide + 1)
  }

  function previous() {
    if ( currentSlide && currentSlide != 0 )
      Router.navigate(currentSlide - 1)
  }

  function _updateCurrentSlide() {
    currentSlide = parseInt( Router.path() ) || 0
    _displaySlide(currentSlide)
  }

  function _displaySlide(id) {
    $slides.removeClass('current').eq(id).addClass('current')
  }

  return {
    next: next
  , previous: previous
  }
})();

Editor.new()

$(document).on('keydown', keyHandler)

function keyHandler(e) {
  switch (e.which) {
    case 39: //right
      Deck.next()
      break;
    case 37: //left
      Deck.previous()
      break;
    case 13: // enter
      console.log('Enter')
      break;
    case 69: // e
      Editor.toggle()
      break;
    default:
      console.log('Unhandled');
      console.log(e);
      break;
  }
}
