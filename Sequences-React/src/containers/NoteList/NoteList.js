import React, { Component } from 'react'
import {
  PageHeader,
  ListGroup,
  ListGroupItem,
  FormControl
} from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import DistanceInWords from 'date-fns/distance_in_words'

class NoteList extends Component {
  state = {
    notes: [],
    searchNotes: [],
    search: ''
  }

  componentDidMount() {
    if (this.props.context.notes.length === 0) {
      this.props.history.push('/')
      return
    }

    const noteList = this.props.context.notes.filter(
      note => note.sequence === this.props.match.params.id
    )

    noteList.sort((a, b) => {
      return a.noteNumber > b.noteNumber
        ? 1
        : b.noteNumber > a.noteNumber
        ? -1
        : 0
    })

    this.setState({
      notes: noteList,
      searchNotes: noteList
    })
  }

  onChange = e => {
    // eslint-disable-next-line
    const newNotes = this.state.notes.filter(note => {
      const result = note.lang1_title.search(new RegExp(e.target.value, 'i'))

      if (result >= 0) {
        return true
      }
    })

    this.setState({ search: e.target.value, searchNotes: newNotes })
  }

  render() {
    return (
      <div className="notes">
        <PageHeader>Slides for {this.props.match.params.id}</PageHeader>
        <FormControl
          onChange={this.onChange}
          value={this.state.search}
          componentClass="input"
          placeholder="Search"
        />
        <hr />
        <LinkContainer
          key="new"
          to={`/notes/new?sequence=${this.props.match.params.id}`}
        >
          <ListGroupItem>
            <h4>
              <b>{'\uFF0B'}</b> Create a new slide
            </h4>
          </ListGroupItem>
        </LinkContainer>
        <ListGroup>
          {this.state.searchNotes.map((note, i) => (
            <LinkContainer
              key={i}
              to={`/sequences/${this.props.match.params.id}/${note.noteNumber}`}
            >
              <ListGroupItem
                header={`${note.lang1_title} - #${note.noteNumber}`}
              >
                Created {DistanceInWords(Date.now(), note.createdAt)} ago
              </ListGroupItem>
            </LinkContainer>
          ))}
        </ListGroup>
      </div>
    )
  }
}

export default NoteList
