import React, { Component } from 'react'
import { API, Storage } from 'aws-amplify'
import { FormGroup, FormControl, ControlLabel } from 'react-bootstrap'

import LoaderButton from '../../components/LoaderButton'
import config from '../../config'
import './Notes.css'
import { s3Upload } from '../../libs/awsLib'

/*
1. Load the note on componentDidMount and save it to the state.
We get the id of our note from the URL using the props automatically passed to us by React-Router in this.props.match.params.id.
The keyword id is a part of the pattern matching in our route (/notes/:id).

2. If there is an attachment, we use the key to get a secure link to the file we uploaded to S3. We then store this to the component’s state as attachmentURL.

3. The reason why we have the note object in the state along with the content and the attachmentURL is because we will be using this later when the user edits the note.
*/
export default class Notes extends Component {
  constructor(props) {
    super(props)

    this.file = null

    this.state = {
      isLoading: null,
      isDeleting: null,
      note: null,
      content: '',
      title: '',
      attachmentURL: null,
      sequence: '',
      slidenum: ''
    }
  }

  async componentDidMount() {
    try {
      let attachmentURL
      const note = await this.getNote()
      const { sequence, slidenum, title, content, attachment } = note

      if (attachment) {
        attachmentURL = await Storage.get(attachment)
      }

      this.setState({
        sequence,
        slidenum,
        note,
        title,
        content,
        attachmentURL
      })
    } catch (e) {
      alert(e)
    }
  }

  getNote() {
    return API.get('notes', `/notes/${this.props.match.params.id}`)
  }

  validateForm() {
    return this.state.content.length > 0
  }

  formatFilename(str) {
    return str.replace(/^\w+-/, '')
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    })
  }

  handleFileChange = event => {
    this.file = event.target.files[0]
  }

  //We save the note by making a PUT request with the note object to /notes/:id where we get the id from this.props.match.params.id. We use the API.put() method from AWS Amplify.
  saveNote(note) {
    return API.put('notes', `/notes/${this.props.match.params.id}`, {
      body: note
    })
  }

  handleSubmit = async event => {
    let attachment

    event.preventDefault()
    //If there is a file to upload we call s3Upload to upload it and save the key we get from S3.
    if (this.file && this.file.size > config.MAX_ATTACHMENT_SIZE) {
      alert(
        `Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE /
          1000000} MB.`
      )
      return
    }

    this.setState({ isLoading: true })

    try {
      if (this.file) {
        attachment = await s3Upload(this.file)
      }

      await this.saveNote({
        sequence: this.state.sequence,
        slidenum: this.state.slidenum,
        content: this.state.content,
        title: this.state.title,
        attachment: attachment || this.state.note.attachment
      })
      this.props.history.push('/')
    } catch (e) {
      alert(e)
      this.setState({ isLoading: false })
    }
  }

  //TODO handle deleting of S3 attachments
  deleteNote() {
    return API.del('notes', `/notes/${this.props.match.params.id}`)
  }

  handleDelete = async event => {
    event.preventDefault()

    const confirmed = window.confirm(
      'Are you sure you want to delete this slide?'
    )

    if (!confirmed) {
      return
    }

    this.setState({ isDeleting: true })

    try {
      await this.deleteNote()
      this.props.history.push('/')
    } catch (e) {
      alert(e)
      this.setState({ isDeleting: false })
    }
  }

  render() {
    return (
      <div className="Notes">
        {this.state.note && (
          <form onSubmit={this.handleSubmit}>
            <FormGroup controlId="sequence">
              <FormControl
                onChange={this.handleChange}
                value={this.state.sequence}
                componentClass="textarea"
              />
            </FormGroup>
            <FormGroup controlId="title">
              <FormControl
                onChange={this.handleChange}
                value={this.state.title}
                componentClass="textarea"
              />
            </FormGroup>
            <FormGroup controlId="content">
              <FormControl
                onChange={this.handleChange}
                value={this.state.content}
                componentClass="textarea"
              />
            </FormGroup>
            {this.state.note.attachment && (
              <FormGroup>
                <ControlLabel>Attachment</ControlLabel>
                <FormControl.Static>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={this.state.attachmentURL}
                  >
                    {this.formatFilename(this.state.note.attachment)}
                  </a>
                </FormControl.Static>
              </FormGroup>
            )}
            <FormGroup controlId="file">
              {!this.state.note.attachment && (
                <ControlLabel>Attachment</ControlLabel>
              )}
              <FormControl onChange={this.handleFileChange} type="file" />
            </FormGroup>
            <LoaderButton
              block
              bsStyle="primary"
              bsSize="large"
              disabled={!this.validateForm()}
              type="submit"
              isLoading={this.state.isLoading}
              text="Save"
              loadingText="Saving…"
            />
            <LoaderButton
              block
              bsStyle="danger"
              bsSize="large"
              isLoading={this.state.isDeleting}
              onClick={this.handleDelete}
              text="Delete"
              loadingText="Deleting…"
            />
          </form>
        )}
      </div>
    )
  }
}
