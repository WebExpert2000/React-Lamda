import React, { Component } from 'react'
import { FormGroup, FormControl, ControlLabel, Button } from 'react-bootstrap'
import { API } from 'aws-amplify'
import Modal from 'react-responsive-modal'
import Switch from 'react-switch'

import config from '../../config'
import { s3Upload } from '../../libs/awsLib'
import LoaderButton from '../../components/LoaderButton'
import LanguageSwitch from '../../components/LanguageSwitch'
//import SharesequenceSwitch from '../../components/LanguageSwitch'


import './NewNote.css'

export default class NewNote extends Component {
  constructor(props) {
    super(props)

    this.file1 = null
    this.file2 = null

    this.state = {
      isLoading: null,
      sequence: '',
      lang1_title: '',
      lang1_content: '',
      lang2_title: '',
      lang2_content: '',
      slidenum: '',
      lang1: 'English',
      lang2: 'French',
      showLanguageModal: false,
      selectedLanguage: 'lang1',
      showFileInput1: false,
      showFileInput2: false,
      isShared: false
    }
  }

  componentDidMount() {
    this.props.context.getNotes()
   
    if (this.props.location.search) {
      this.setState({
        sequence: this.props.location.search.split('=')[1]
      })
    }
  }

  validateForm() {
    return this.state.lang1_title.length > 0 && this.state.sequence.length > 0
  }

  handleChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  handleFileChange1 = event => {
    this.file1 = event.target.files[0]
  }

  handleFileChange2 = event => {
    this.file2 = event.target.files[0]
  }

  handleSubmit = async event => {
    event.preventDefault()

    if (this.file1 && this.file1.size > config.MAX_ATTACHMENT_SIZE) {
      alert(
        `Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE /
          1000000} MB for attachment 1.`
      )
      return
    }

    if (this.file2 && this.file2.size > config.MAX_ATTACHMENT_SIZE) {
      alert(
        `Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE /
          1000000} MB for attachment 2.`
      )
      return
    }

    this.setState({ isLoading: true })

    try {
      const attachment1 = this.file1 ? await s3Upload(this.file1) : null

      const attachment2 = this.file2 ? await s3Upload(this.file2) : null

      /* Check to see if new sequence title is an existing sequence */
      const { notes } = this.props.context

      const sequenceTitles = notes.map(note => note.sequence)

      let noteToSend

      if (sequenceTitles.indexOf(this.state.sequence) !== -1) {
        const numberOfNotesWithSequence = sequenceTitles.filter(
          st => st === this.state.sequence
        ).length

        noteToSend = {
          attachment1,
          attachment2,
          sequence: this.state.sequence,
          lang1_content: this.state.lang1_content,
          lang1_title: this.state.lang1_title,
          lang2_content: this.state.lang2_content,
          lang2_title: this.state.lang2_title,
          lang1: this.state.lang1,
          lang2: this.state.lang2,
          isShared: this.state.isShared,
          noteNumber: numberOfNotesWithSequence + 1.
        }
      } else {
        noteToSend = {
          attachment1,
          attachment2,
          sequence: this.state.sequence,
          lang1_content: this.state.lang1_content,
          lang1_title: this.state.lang1_title,
          lang2_content: this.state.lang2_content,
          lang2_title: this.state.lang2_title,
          lang1: this.state.lang1,
          lang2: this.state.lang2,
          isShared: this.state.isShared,
          noteNumber: 1
        }
      }
      await this.createNote(noteToSend)

      await this.props.context.getNotes()

      this.setState({
        isLoading: false
      })

      this.props.history.push(
        `/sequences/${this.state.sequence}/${noteToSend.noteNumber}?new=true`
      )
    } catch (e) {
      alert(e)
      console.log(e.response)
      this.setState({ isLoading: false })
    }
  }

  createNote(note) {
    return API.post('notes', '/notes', {
      body: note
    })
  }

  openModal = e => {
    e.preventDefault()
    this.setState({ showLanguageModal: true })
  }

  changeLang = e => {
    const lang = e.target.textContent
    if (lang.length > 0) {
      this.setState({
        selectedLanguage: this.state.lang1 === lang ? 'lang1' : 'lang2'
      })
    }
  }

  isShared = e => {
 this.setState(prevState => ({
      isShared: !prevState.isShared
    }));
  };

  render() {
    return (
      <>
        <Modal
          open={this.state.showLanguageModal}
          onClose={() => this.setState({ showLanguageModal: false })}
          center
        >
          <label>Language 1: </label>
          <input
            onChange={this.handleChange}
            name="lang1"
            className="form-control"
            value={this.state.lang1}
          />
          <hr />
          <label>Language 2: </label>
          <input
            onChange={this.handleChange}
            className="form-control"
            name="lang2"
            value={this.state.lang2}
          />
          <br />

          <button
            onClick={() => this.setState({ showLanguageModal: false })}
            className="btn btn-primary"
          >
            Save
          </button>
          <br />
          <small>Note: re-toggle slider to activate new languages.</small>
        </Modal>
        <div className="NewNote">
          <form onSubmit={this.handleSubmit}>
          <div className="text-right" >
                
                  <button onClick={this.openModal} className="btn">
                    change languages
                  </button>
                
                <LanguageSwitch
                  lang1={this.state.lang1}
                  lang2={this.state.lang2}
                  changeLang={this.changeLang}
                 
                />
                
                </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width:'100%'
              }}
            >
              <div>
                <h3>Sequence Title</h3>
              </div>

                <div>

                <label>
                <span>Share this sequence</span>
                <Switch
                  onChange={this.isShared.bind(this)}
                  checked={this.state.isShared}
                  className="react-switch"
                />
              </label>
               

              </div>
            </div>
            <FormGroup>
              <FormControl
                name="sequence"
                onChange={this.handleChange}
                value={this.state.sequence}
                componentClass="textarea"
                placeholder="Name of the sequence. This slide will be added to a sequence with this name."
              />
            </FormGroup>
            <div>
              <h3>Slide Title</h3>
            </div>
            <FormGroup>
              <FormControl
                name={this.state.selectedLanguage + `_title`}
                onChange={this.handleChange}
                value={
                  this.state[this.state.selectedLanguage + `_title`] === null
                    ? ''
                    : this.state[this.state.selectedLanguage + `_title`]
                }
                componentClass="textarea"
                placeholder="Name of the slide."
              />
            </FormGroup>
            <div>
              <h3>Slide Content</h3>
            </div>
            <FormGroup>
              <FormControl
                name={this.state.selectedLanguage + `_content`}
                onChange={this.handleChange}
                value={
                  this.state[this.state.selectedLanguage + `_content`] === null
                    ? ''
                    : this.state[this.state.selectedLanguage + `_content`]
                }
                componentClass="textarea"
                rows="6"
                placeholder="Content of the slide."
              />
            </FormGroup>

            <hr />
            {this.state.showFileInput1 ? (
              <FormGroup controlId="file1">
                <ControlLabel>Slide Attachment 1</ControlLabel>
                <FormControl onChange={this.handleFileChange1} type="file" />
              </FormGroup>
            ) : (
              <Button
                bsStyle="primary"
                onClick={() => this.setState({ showFileInput1: true })}
              >
                Add attachment 1
              </Button>
            )}
            <br />
            <br />
            {this.state.showFileInput2 ? (
              <FormGroup controlId="file2">
                <ControlLabel>Slide Attachment 2</ControlLabel>
                <FormControl onChange={this.handleFileChange2} type="file" />
              </FormGroup>
            ) : (
              <Button
                bsStyle="primary"
                onClick={() => this.setState({ showFileInput2: true })}
              >
                Add attachment 2
              </Button>
            )}
            <hr />
            <LoaderButton
              block
              bsStyle="primary"
              bsSize="large"
              disabled={!this.validateForm()}
              type="submit"
              isLoading={this.state.isLoading}
              text="Create"
              loadingText="Creating…"
            />
          </form>
        </div>
      </>
    )
  }
}
