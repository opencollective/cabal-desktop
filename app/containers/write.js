import form from 'get-form-data'
import React, { Fragment, Component } from 'react'
import { connect } from 'react-redux'
import { addMessage, onCommand } from '../actions'

import '../../node_modules/emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'

const mapStateToProps = state => {
  var cabal = state.cabals[state.currentCabal]
  return {
    addr: state.currentCabal,
    cabal,
    users: cabal.users,
    currentChannel: state.currentChannel
  }
}

const mapDispatchToProps = dispatch => ({
  addMessage: ({addr, message}) => dispatch(addMessage({addr, message})),
  onCommand: ({addr, message}) => dispatch(onCommand({addr, message}))
})

class writeScreen extends Component {
  constructor (props) {
    super(props)
    this.minimumHeight = 48
    this.defaultHeight = 17 + this.minimumHeight
    this.focusInput = this.focusInput.bind(this);
    this.clearInput = this.clearInput.bind(this);
    this.resizeTextInput = this.resizeTextInput.bind(this);
    this.addEmoji = this.addEmoji.bind(this);
    this.showEmojis = this.showEmojis.bind(this);
  }

  componentDidMount(){
    this.focusInput()
    this.resizeTextInput()
    window.addEventListener('focus', (e) => this.focusInput())
  }

  componentWillUnmount () {
    window.removeEventListener('focus')
  }

  componentDidUpdate(prevProps){
    if (this.props.showEmojiPicker !== prevProps.showEmojiPicker){
      this.showEmojis()
    }
    if (this.props.currentChannel !== prevProps.currentChannel){
      this.focusInput()
      this.props.toggleEmojis(false)
    }
  }

  onKeyDown (e) {
    const {cabal} = this.props
    if (e.key === 'Tab') {
      var el = this.textInput
      var line = el.value
      var users = Object.keys(cabal.users).sort()
      var pattern = (/^(\w+)$/)
      var match = pattern.exec(line)

      if (match) {
        users = users.filter(user => user.startsWith(match[0]))
        if (users.length > 0) el.value = users[0] + ': '
      }
      e.preventDefault()
      e.stopPropagation()
      el.focus();
    } else if (e.keyCode === 13 && e.shiftKey){
      this.textInput.value = this.textInput.value + "\n"
      e.preventDefault()
      e.stopPropagation()
    } else if (e.keyCode === 13 && !e.shiftKey){
      const data = form(this.formField)
      var el = this.textInput
      el.value = ''
      const {addr, addMessage, onCommand} = this.props
      var opts = {message: data.message, addr}
      if (data.message.startsWith('/')) onCommand(opts)
      else addMessage(opts)
      e.preventDefault()
      e.stopPropagation()
    }
  }

  onsubmit (e) {
    // only prevent default keydown now handles logic to better support shift commands
    e.preventDefault()
    e.stopPropagation()
  }

  showEmojis() {
    this.emojiPicker.style.display = this.emojiPicker.style.display === 'none' ? 'block' : 'none';
    this.resizeTextInput()
  }

  addEmoji (emoji) {
    this.textInput.value = this.textInput.value + emoji.native
    this.resizeTextInput()
    this.focusInput()
  }

  resizeTextInput () {
    this.textInput.style.height = "10px";
    this.textInput.style.height = (this.textInput.scrollHeight)+"px";
    if(this.textInput.scrollHeight < 48){
      this.emojiPicker.style.bottom = (88)+"px";
    } else {
      this.emojiPicker.style.bottom = (this.textInput.scrollHeight+40)+"px";
    }
  }

  focusInput () {
    this.textInput.focus();
  }

  clearInput () {
    this.textInput.value = ''
  }

  render () {
    const { cabal } = this.props

    if (!cabal) {
      return (
        <Fragment>
          <div />
        </Fragment>
      )
    }

    return (
      <div className={'composerContainer'} onClick={(e) => this.focusInput()}>
        <div className={'composer'}>
          {/* <div className={'composer__meta'}><img src='static/images/icon-composermeta.svg' /></div> */}
          <div className={'composer__input'}>
            <form 
              onSubmit={this.onsubmit.bind(this)}
              ref={(form) => { this.formField = form;}}>
              <textarea
                id='message-bar'
                name='message'
                onKeyDown={this.onKeyDown.bind(this)}
                onKeyUp={(e) => this.resizeTextInput()}
                ref={(input) => { this.textInput = input;}} 
                aria-label='Type a message and press enter'
                placeholder='Write a message'
              />
            </form>
          </div>
          <div ref={(el) => { this.emojiPicker = el;}} style={{ position: 'absolute', bottom: '100px', right: '20px', display: 'none'}}>
            <Picker 
              onSelect={this.addEmoji}
              sheetSize={64}
              />
          </div>
          <div className={'composer__other'} onClick={(e) => this.props.toggleEmojis()}><img src='static/images/icon-composerother.svg' /></div>
        </div>
      </div>
    )
  }
}

const WriteContainer = connect(mapStateToProps, mapDispatchToProps)(writeScreen)

export default WriteContainer
