import React, { Component } from "react"
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap"
import { API } from "aws-amplify"

import LoaderButton from "../../components/LoaderButton"
import config from "../../config"
import "./NewNote.css"
import { s3Upload } from "../../libs/awsLib"

export default class NewNote extends Component {
  constructor(props) {
    super(props)

    this.file = null

    this.state = {
      isLoading: null,
      title: ""
    }
  }

  validateForm() {
    return this.state.title.length > 0
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    })
  }

  handleFileChange = event => {
    this.file = event.target.files[0]
  }

  handleSubmit = async event => {
    event.preventDefault()

    if (this.file && this.file.size > config.MAX_ATTACHMENT_SIZE) {
      alert(
        `Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE /
          1000000} MB.`
      )
      return
    }

    //if (this.state.title == API)

    this.setState({ isLoading: true })

    try {
      const attachment = this.file ? await s3Upload(this.file) : null

      await this.createNote({
        attachment,
        content: this.state.content,
        title: this.state.title
      })
      this.props.history.push("/")
    } catch (e) {
      alert(e)
      this.setState({ isLoading: false })
    }
  }

  createNote(note) {
    return API.post("notes", "/notes", {
      body: note
    })
  }

  render() {
    return (
      <div className="NewNote">
        <form onSubmit={this.handleSubmit}>
          <div>
            <h3>Title</h3>
          </div>
          <FormGroup controlId="title">
            <FormControl
              onChange={this.handleChange}
              value={this.state.title}
              componentClass="textarea"
            />
          </FormGroup>
          <div>
            <h3>Content</h3>
          </div>
          <FormGroup controlId="content">
            <FormControl
              onChange={this.handleChange}
              value={this.state.content}
              componentClass="textarea"
              rows="6"
            />
          </FormGroup>
          <FormGroup controlId="file">
            <ControlLabel>Attachment</ControlLabel>
            <FormControl onChange={this.handleFileChange} type="file" />
          </FormGroup>
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
    )
  }
}
