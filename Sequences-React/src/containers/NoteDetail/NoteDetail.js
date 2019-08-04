import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import FileViewer from 'react-file-viewer'
import { API, Auth } from 'aws-amplify'
import {
  FormGroup,
  FormControl,
  ControlLabel,
  Button,
  Alert
} from 'react-bootstrap'
import Modal from 'react-responsive-modal'
import Switch from 'react-switch'
import config from '../../config'
import { s3Upload } from '../../libs/awsLib'

import LoaderButton from '../../components/LoaderButton'
import LanguageSwitch from '../../components/LanguageSwitch'

class NoteDetail extends Component {
  state = {
    note: {},
    isLoading: false,
    sequence: '',
    lang1_title: '',
    lang2_title: '',
    lang1_content: '',
    lang2_content: '',
    lang1: '',
    lang2: '',
    maxNumber: null,
    showLanguageModal: false,
    selectedLanguage: 'lang1',
    sub: '',
    showFileInput1: false,
    showFileInput2: false,
    isShared:false,
    disabled:''
  }

  componentDidMount() {
    if (this.props.context.notes.length === 0) {
      this.props.history.push('/')
      return
    }
    this.findAndGetNote()
  
   
    Auth.currentAuthenticatedUser(user => {
      this.setState({ sub: user.attributes.sub })
    })
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params !== prevProps.match.params) {
      this.findAndGetNote()
    }
  }
 isShared = e => {
  if(this.state.disabled)
    return;
 this.setState(prevState => ({
      isShared: !prevState.isShared
    }));
  };

  findAndGetNote = () => {
    const note = this.props.context.notes.find(
      note =>
        note.sequence === this.props.match.params.sequenceId &&
        note.noteNumber === Number(this.props.match.params.noteNumber)
    )

    if (!note) {
      this.props.history.push('/')
      return
    }

    // Find max note number
    const notesWithSequence = this.props.context.notes.filter(
      note => note.sequence === this.props.match.params.sequenceId
    )

    const allNoteNumbers = notesWithSequence.map(note => note.noteNumber)

    const maxNumber = Math.max.apply(null, allNoteNumbers)
    var obj = Auth._storage;
    
    var me=obj['aws.cognito.identity-id.us-east-2:908db61f-89ad-4816-8078-a129ad45157b'];
    var disabled = "";
    if(note.userId !== me)
      disabled = "true";
   
    this.setState({
      note,
      sequence: note.sequence,
      lang1_title: note.lang1_title,
      lang2_title: note.lang2_title,
      lang1_content: note.lang1_content,
      lang2_content: note.lang2_content,
      lang1: note.lang1,
      disabled:disabled,
      isShared:note.isShared,
      lang2: note.lang2,
      maxNumber
    })

    console.log(disabled);
  }

  changeLang = e => {
    
    const lang = e.target.textContent
    if (lang.length > 0) {
      this.setState({
        selectedLanguage: this.state.lang1 === lang ? 'lang1' : 'lang2'
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

  openModal = e => {
    e.preventDefault()
    this.setState({ showLanguageModal: true })
  }

  handleSubmit = async event => {
    event.preventDefault()

    this.setState({ isLoading: true })

    if (this.file1 && this.file1.size > config.MAX_ATTACHMENT_SIZE) {
      alert(
        `Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE /
          1000000} MB for attachment.`
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

    try {
      const attachment1 = this.file1
        ? await s3Upload(this.file1)
        : this.state.note.attachment1
        ? this.state.note.attachment1
        : null

      const attachment2 = this.file2
        ? await s3Upload(this.file2)
        : this.state.note.attachment2
        ? this.state.note.attachment2
        : null

      await API.del('notes', `/notes/${this.state.note.noteId}`)

      await API.post('notes', '/notes', {
        body: {
          attachment1,
          attachment2,
          sequence: this.state.sequence,
          lang1_content: this.state.lang1_content,
          lang1_title: this.state.lang1_title,
          lang2_content: this.state.lang2_content,
          lang2_title: this.state.lang2_title,
          lang1: this.state.lang1,
          lang2: this.state.lang2,
          isShared:this.state.isShared,
          noteNumber: this.state.note.noteNumber
        }
      })

      await this.props.context.getNotes()

      this.setState({
        isLoading: false
      })
    } catch (e) {
      alert(e)
      console.log(e.response)
      this.setState({ isLoading: false })
    }
  }

  onDeleteNote = async () => {
    const confirm = window.confirm('Are you sure you want to delete this note?')

    if (confirm) {
      try {
        await API.del('notes', `/notes/${this.state.note.noteId}`)
        console.log('-> Deleted note.')
        this.props.history.push('/')
      } catch (err) {
        alert(err)
      }
    }
  }

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
            disabled=""
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
        <div>
          {this.props.location.search === '?new=true' && (
            <Alert variant="primary">Note has been created!</Alert>
          )}

          <form onSubmit={this.handleSubmit}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <h3>Sequence Title</h3>
              </div>
              <div className="text-center">
                <LanguageSwitch
                  lang1={this.state.lang1}
                  lang2={this.state.lang2}
                  changeLang={this.changeLang}
              
                />
                <button onClick={this.openModal} className="btn" disabled={this.state.disabled? "disabled":""}>
                  Change languages
                </button>
              </div>
               <label>
                <span>Share this sequence</span>
                <Switch
                  onChange={this.isShared.bind(this)}
                  checked={this.state.isShared}
                  className="react-switch"
                  disabled=""
                />
              </label>
               
            </div>

            <FormGroup>
          
              {

                this.state.disabled?
              <div style={{padding:"0 0 30px 10px"}}>
                {this.state.sequence}
                </div>
              :
              <FormControl
                onChange={this.handleChange}
                value={this.state.sequence}
                name="sequence"
                
                componentClass="textarea"
                placeholder="Name of the sequence. This slide will be added to a sequence with this name."
              />
              }
            </FormGroup>
            <div>
              <h3>Slide Title</h3>
            </div>
            <FormGroup>
            {

                this.state.disabled?
             <div style={{padding:"0 0 30px 10px"}}>
               
                {
                  this.state[this.state.selectedLanguage + `_title`] === null
                    ? ''
                    : this.state[this.state.selectedLanguage + `_title`]
                  }
               </div>
              :
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
            }
            </FormGroup>
            <div>
              <h3>Slide Content</h3>
            </div>
            <FormGroup>
            {

                this.state.disabled?
              <div style={{padding:"0 0 30px 10px"}}>
              {
               
                  this.state[this.state.selectedLanguage + `_content`] === null
                    ? ''
                    : this.state[this.state.selectedLanguage + `_content`]

                }
               </div>
              :
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
            }
            </FormGroup>
            {this.state.showFileInput1   ? (
              <FormGroup controlId="file1">
                <ControlLabel>Slide Attachment 1</ControlLabel>
              
                <FormControl onChange={this.handleFileChange1} type="file" disabled/>
                
              
              </FormGroup>
            ) : (
            <div>
            {
              !this.state.disabled?
              <Button
                bsStyle="primary"
                onClick={() => this.setState({ showFileInput1: true })}
                
              >
                Add attachment 1
              </Button>
             :""
            }</div>)}
            <br />
            <br />

            {this.state.showFileInput2 ? (
              <FormGroup controlId="file2">
                <ControlLabel>Slide Attachment 2</ControlLabel>
                {
                this.state.disabled?
                <FormControl onChange={this.handleFileChange2} type="file" disabled/>
                :
                <FormControl onChange={this.handleFileChange2} type="file" />
              }
              </FormGroup>
            ) : (
            <div>
            {
              !this.state.disabled?
            
              <Button
                bsStyle="primary"
                 disabled={this.state.disabled? "disabled":""}
                onClick={() => this.setState({ showFileInput2: true })}
              >
                Add attachment 2
              </Button>
              :""
            }</div>)}
            <hr />
            {this.state.note.attachment1 &&
            (this.state.note.attachment1.split('.').pop() === 'mov' ||
              this.state.note.attachment1.split('.').pop() === 'MOV') ? (
              <div className="mov-container text-center">
                <video
                  controls="controls"
                  width="600"
                  height="400"
                  src={`https://utell-app-uploads.s3-ap-southeast-2.amazonaws.com/public/${
                    this.state.note.attachment1
                  }`}
                />
              </div>
            ) : (
              this.state.note.attachment1 && (
                <div>
                  <FileViewer
                    fileType={
                      this.state.note.attachment1 &&
                      this.state.note.attachment1.split('.').pop()
                    }
                    filePath={
                      this.state.note.attachment1 &&
                      `https://utell-app-uploads.s3-ap-southeast-2.amazonaws.com/public/${
                        this.state.note.attachment1
                      }`
                    }
                  />
                </div>
              )
            )}
            <br />
            <br />
            <br />
            {this.state.note.attachment2 &&
            (this.state.note.attachment2.split('.').pop() === 'mov' ||
              this.state.note.attachment2.split('.').pop() === 'MOV') ? (
              <div className="mov-container text-center">
                <video
                  controls="controls"
                  width="600"
                  height="400"
                  src={`https://utell-app-uploads.s3-ap-southeast-2.amazonaws.com/public/${
                    this.state.note.attachment2
                  }`}
                />
              </div>
            ) : (
              this.state.note.attachment2 && (
                <div>
                  <FileViewer
                    fileType={
                      this.state.note.attachment2 &&
                      this.state.note.attachment2.split('.').pop()
                    }
                    filePath={
                      this.state.note.attachment2 &&
                      `https://utell-app-uploads.s3-ap-southeast-2.amazonaws.com/public/${
                        this.state.note.attachment2
                      }`
                    }
                  />
                </div>
              )
            )}
            <hr />
            {
              !this.state.disabled?            
            <LoaderButton
              block
              bsStyle="primary"
              bsSize="large"
              disabled={!this.validateForm()}
              type="submit"
              isLoading={this.state.isLoading}
              text="Update Slide"
               disabled={this.state.disabled? "disabled":""}
              loadingText="Updating..."
            />
            :""
            }
          </form>
          {
            !this.state.disabled?
          <LoaderButton
            block
            bsStyle="danger"
            bsSize="large"
            isLoading={this.state.isLoading}
            text="Delete Slide"
            loadingText="Deleting..."
             disabled={this.state.disabled? "disabled":""}
            style={{ marginTop: '5px' }}
            onClick={this.onDeleteNote}
          />
          :""
        }
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '5px'
              }}
            >

              {this.state.note.noteNumber > 1 ? (
                <Link
                  to={`/sequences/${this.state.note.sequence}/${this.state.note
                    .noteNumber - 1}`}
                >
                  <Button bsStyle="success" bsSize="lg">
                    Previous
                  </Button>
                </Link>
              ) : (
                <Button bsStyle="success" bsSize="lg" disabled>
                  Previous
                </Button>
              )}

              <p>Slide #{this.state.note.noteNumber}</p>
              {this.state.note.noteNumber !== this.state.maxNumber ? (
                <Link
                  to={`/sequences/${this.state.note.sequence}/${this.state.note
                    .noteNumber + 1}`}
                >
                  <Button bsStyle="success" bsSize="lg">
                    Next
                  </Button>
                </Link>
              ) : (
                <Link to={`/notes/new?sequence=${this.state.note.sequence}`}>
                  <Button bsStyle="success" bsSize="lg" disabled={this.state.disabled? "disabled":""}>
                    + Create a new slide
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </>
    )
  }
}

export default NoteDetail
