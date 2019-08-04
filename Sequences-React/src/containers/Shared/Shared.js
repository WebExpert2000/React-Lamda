import React, { Component } from "react"
import {
  PageHeader,
  ListGroup,
  ListGroupItem,
  FormControl
} from "react-bootstrap"
import { LinkContainer } from "react-router-bootstrap"
import "./Shared.css"

export default class Shared extends Component {
  state = {
    search: "",
    searchNotes: [],
    allNotes: []
  }

  async componentDidMount() {
    if (!this.props.isAuthenticated) {
      return
    }

    const notes = await this.props.context.getSharedNotes()
    
    
    this.setState({ allNotes: notes, searchNotes: notes })
  }

  onChange = e => {
    // eslint-disable-next-line
    var i = 0;
    const newNotes = this.state.allNotes.filter(note => {

      const result = note.sequence.search(new RegExp(e.target.value, "i"))
       
      if (result >= 0) {
        i++;
        console.log(i);
        if(e.target.value !== "")
        {
          if(i===51){
            return false;
          } 
        }
      
        return true
      }

    })
   // newNotes[1]=null;

    this.setState({ search: e.target.value, searchNotes: newNotes })
  }

  renderNotesList(notes) {
    /* Since the API does not have a resource for Sequences and only Notes,
     *  it's neccessary to extract unique sequences from the list of notes like below.
     */
    const uniqueSequenceNotes = []

    notes.filter(note => {
      let i = uniqueSequenceNotes.findIndex(x => x.sequence === note.sequence)
      if (i <= -1) {
        uniqueSequenceNotes.push(note)
      }
      return null
    })
    const sequenceList = uniqueSequenceNotes.map((note, i) => (
      <LinkContainer key={i} to={`/sharedsequences/${note.sequence}`}>
        <ListGroupItem header={note.sequence.trim().split("\n")[0]}>
          {"Created: " + new Date(note.createdAt).toLocaleString() + " By"}
        </ListGroupItem>
      </LinkContainer>
    ))

    /* Render */
    return (
      <>
         
        {sequenceList}
      </>
    )
  }

  renderLander() {
    return (
      <div className="lander">
        <h1>UTell</h1>
        <p>Easy Knowledge Sharing!</p>
      </div>
    )
  }

  renderNotes() {
    return (
      <div className="notes">
        <PageHeader>Shared Sequences</PageHeader>
        {this.props.context.loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <FormControl
              onChange={this.onChange}
              value={this.state.search}
              componentClass="input"
              placeholder="Search"
            />
            <hr />
            <ListGroup>
              {this.renderNotesList(this.state.searchNotes)}
            </ListGroup>
          </>
        )}
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
