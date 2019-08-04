import React, { Component } from 'react'
import { PageHeader, ListGroup, ListGroupItem } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import { API } from 'aws-amplify'

import './Home.css'

export default class NewSequence extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isLoading: true,
      notes: []
    }
  }

  //
  async componentDidMount() {
    if (!this.props.isAuthenticated) {
      return
    }

    try {
      const notes = await this.notes()
      this.setState({ notes })
    } catch (e) {
      alert(e)
    }

    this.setState({ isLoading: false })
  }

  notes() {
    return API.get('notes', `/notes/${this.props.match.params.id}`)
  }

  /* 
1. Renders a Create a new note button as the first item in the list (even if the list is empty).
We do this by concatenating an array with an empty object with our notes array.
2. Render the first line of each note as the ListGroupItem header by doing note.content.trim().split('\n')[0].
3. And the LinkContainer component directs our app to each of the items.
*/

  renderNotesList(notes) {
    return [{}].concat(notes).map((note, i) =>
      i !== 0 ? (
        <LinkContainer key={note.noteId} to={`/notes/${note.noteId}`}>
          <ListGroupItem header={note.title.trim().split('\n')[0]}>
            {'Created: ' + new Date(note.createdAt).toLocaleString() + ' By'}
          </ListGroupItem>
        </LinkContainer>
      ) : (
        <LinkContainer key="new" to="/notes/new">
          <ListGroupItem>
            <h4>
              <b>{'\uFF0B'}</b> Create a new sequence
            </h4>
          </ListGroupItem>
        </LinkContainer>
      )
    )
  }
  /* 
  renderNotesList(notes) {
    var roots = [], children = {};

    // find the top level nodes and hash the children based on parent
    for (var i = 0, len = arry.length; i < len; ++i) {
        var item = arry[i],
            p = item.Parent,
            target = !p ? roots : (children[p] || (children[p] = []));

        target.push({ value: item });
    }

    // function to recursively build the tree
    var findChildren = function(parent) {
        if (children[parent.value.Id]) {
            parent.children = children[parent.value.Id];
            for (var i = 0, len = parent.children.length; i < len; ++i) {
                findChildren(parent.children[i]);
            }
        }
    };
      // enumerate through to handle the case where there are multiple roots
      for (var i = 0, len = roots.length; i < len; ++i) {
        findChildren(roots[i]);
    }

    return roots;
}
*/

  renderLander() {
    return (
      <div className="lander">
        <h1>UTell</h1>
        <p>Easy Knowledge Sharing!</p>
      </div>
    )
  }
  //Store our notes in the state.
  renderNotes() {
    return (
      <div className="notes">
        <PageHeader>Your Sequences</PageHeader>
        <ListGroup>
          {!this.state.isLoading && this.renderNotesList(this.state.notes)}
        </ListGroup>
      </div>
    )
  }
  //Rendering the lander or the list of notes based on this.props.isAuthenticated.
  render() {
    return (
      <div className="Home">
        {this.props.isAuthenticated ? this.renderNotes() : this.renderLander()}
      </div>
    )
  }
}
