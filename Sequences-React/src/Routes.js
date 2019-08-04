import React from "react"
import { Route, Switch } from "react-router-dom"
import Home from "./containers/Home/Home"
import Shared from "./containers/Shared/Shared"
import NotFound from "./containers/NotFound/NotFound"
import Login from "./containers/Login/Login"
import AppliedRoute from "./components/AppliedRoute"
import Signup from "./containers/Signup/Signup"
import NoteList from "./containers/NoteList/NoteList"
import SharedNoteList from "./containers/NoteList/SharedNoteList"
import NewNote from "./containers/NewNote/NewNote"
import Notes from "./containers/Notes/Notes"
import NoteDetail from "./containers/NoteDetail/NoteDetail"
import AuthenticatedRoute from "./components/AuthenticatedRoute"
import UnauthenticatedRoute from "./components/UnauthenticatedRoute"

import SequencesContext from "./Context"

export default ({ childProps }) => (
  <SequencesContext.Consumer>
    {context => (
      <Switch>
        <AppliedRoute
          path="/"
          exact
          component={Home}
          props={{ context, ...childProps }}
        />
        <UnauthenticatedRoute
          path="/login"
          exact
          component={Login}
          props={childProps}
        />
        <UnauthenticatedRoute
          path="/signup"
          exact
          component={Signup}
          props={childProps}
        />
        <AuthenticatedRoute
          path="/sequences/:id"
          exact
          component={NoteList}
          props={{ context, ...childProps }}
        />
        <AuthenticatedRoute
          path="/sharedsequences/:id"
          exact
          component={SharedNoteList}
          props={{ context, ...childProps }}
        />
        <AuthenticatedRoute
          path="/sequences/:sequenceId/:noteNumber"
          exact
          component={NoteDetail}
          props={{ context, ...childProps }}
        />
         <AuthenticatedRoute
          path="/sharedsequences/:sequenceId/:noteNumber"
          exact
          component={NoteDetail}
          props={{ context, ...childProps }}
        />
        <AuthenticatedRoute
          path="/notes/new"
          exact
          component={NewNote}
          props={{ context, ...childProps }}
        />
        <AuthenticatedRoute
          path="/notes/:id"
          exact
          component={Notes}
          props={childProps}
        />
        
        <AppliedRoute
          path="/sharedsequences"
          exact
          component={Shared}
          props={{ context, ...childProps }}
        />
        {/* Finally, catch all unmatched routes */}
        <Route component={NotFound} />
      </Switch>
    )}
  </SequencesContext.Consumer>
)
