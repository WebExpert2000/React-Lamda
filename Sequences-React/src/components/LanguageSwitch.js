import React from "react"

const LanguageSwitch = props => {
  return (
    <div style={swithstyle}>
      <label className="switch-light switch-candy" onClick={props.changeLang}>
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
const swithstyle = {
  width: '250px',
  float:'right',
};
export default LanguageSwitch
