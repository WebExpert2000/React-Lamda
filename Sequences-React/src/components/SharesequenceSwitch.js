import React from "react"

const SharesequenceSwitch = props => {
  return (
    <div style={{ width: "250px" }}>
      <label className="react-switch" onClick={props.shareSequence}>
        <input type="checkbox" />
        <span>
          <span>{props.lang1}</span>
          <span>{props.lang2}</span>
          {/* eslint-disable-next-line */}
          <a />
        </span>
      </label>
    </div>
  )
}

export default SharesequenceSwitch




export default class BasicExample extends Component {
  constructor() {
    super();
    this.state = { checked: false };
    this.handleChange = this.handleChange.bind(this);
  }



  handleChange(checked) {
    this.setState({ checked });
  }

  render() {
    return (
      <div className="example">
        <h2>Simple usage</h2>
        <label>
          <span>Switch with default style</span>
          <Switch
            onChange={this.handleChange}
            checked={this.state.checked}
            className="react-switch"
          />
        </label>
        <p>The switch is <span>{this.state.checked ? 'on' : 'off'}</span>.</p>
      </div>
    );
  }
}