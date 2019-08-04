import React, { Component, Fragment } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { Nav, Navbar, NavItem } from 'react-bootstrap'
import Routes from './Routes'
import { LinkContainer } from 'react-router-bootstrap'
import { Auth, API } from 'aws-amplify'
import './App.css'

import SequencesContext from './Context'

class SequencesProvider extends Component {
  state = {
    notes: [],
    loading: false
  }
  
  getNotes = async () => {
    return new Promise((resolve, reject) => {
      console.log('-> Getting all notes...')

      this.setState({ loading: true })

      API.get('notes', '/notes')
        .then(notes => {
          this.setState({ notes, loading: false }, () => resolve(notes))
        })
        .catch(err => {
          alert(err)
          this.setState({ loading: false }, () => reject(err))
        })
    })
  }
  getSharedNotes = async () => {
    return new Promise((resolve, reject) => {
      console.log('-> Getting all sharednotes...')

      this.setState({ loading: true })

      API.get('notes', '/v2/notes?isShared=true')
        .then(notes => {
          this.setState({ notes, loading: false }, () => resolve(notes))
        })
        .catch(err => {
          alert(err)
          this.setState({ loading: false }, () => reject(err))
        })
    })
  }
  render() {
    return (
      <SequencesContext.Provider
        value={{
          notes: this.state.notes,
          loading: this.state.loading,
          getNotes: this.getNotes,
          getSharedNotes: this.getSharedNotes
        }}
      >
        {this.props.children}
      </SequencesContext.Provider>
    )
  }
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isAuthenticated: false,
      isAuthenticating: true
    }
  }

  async componentDidMount() {
    try {
      await Auth.currentSession()
      this.userHasAuthenticated(true)
    } catch (e) {
      if (e !== 'No current user') {
        alert(e)
      }
    }

    this.setState({ isAuthenticating: false })
  }

  userHasAuthenticated = authenticated => {
    this.setState({ isAuthenticated: authenticated })
  }

  // Redirects us back to the login page once the user logs out.
  handleLogout = async event => {
    await Auth.signOut()
    this.userHasAuthenticated(false)
    this.props.history.push('/login')
  }

  render() {
    const urlData = this.props.history.location.pathname.split('/')

    let navbarTitle
    let navLink

    if (urlData.length - 1 === 3) {
      navbarTitle = urlData[2]
      navLink = `/sequences/${urlData[2]}`
    } else {
      navbarTitle = 'Your Sequences'
      navLink = '/'
    }

    const childProps = {
      isAuthenticated: this.state.isAuthenticated,
      userHasAuthenticated: this.userHasAuthenticated
    }

    return (
      !this.state.isAuthenticating && (
        <SequencesProvider>
          <div className="App container">
            <Navbar fluid collapseOnSelect expand="lg" bg="dark" variant="dark">
              <Navbar.Header>
                <Navbar.Brand>
                  <Link to="/">Utell</Link>
                </Navbar.Brand>
                <Navbar.Toggle />
              </Navbar.Header>

              <Navbar.Collapse>
                <Nav className="mr-auto">
                  <Navbar.Brand>
                    <Link to={navLink}>{navbarTitle}</Link>
                  </Navbar.Brand>
                </Nav>
                <Nav className="mr-auto" style={{ margin: '0 0 0 25%' }}>
                  <Navbar.Brand>
                    <Link to="/sharedsequences">ShareSequences</Link>
                  </Navbar.Brand>
                </Nav>
                <Nav pullRight>
                  {this.state.isAuthenticated ? (
                    <NavItem onClick={this.handleLogout}>Logout</NavItem>
                  ) : (
                    <Fragment>
                      <LinkContainer to="/signup">
                        <NavItem>Signup</NavItem>
                      </LinkContainer>
                      <LinkContainer to="/login">
                        <NavItem>Login</NavItem>
                      </LinkContainer>
                    </Fragment>
                  )}
                </Nav>
              </Navbar.Collapse>

            </Navbar>

            <Routes childProps={childProps} />
          </div>
        </SequencesProvider>
      )
    )
  }
}

export default withRouter(App)
