import React from "react";

export default class LocationDropdown extends React.Component {
  render() {
    return (
      <div
        id="locationDropdownContainer"
        className={this.props.open ? "open" : ""}
      >
        <div id="locationDropdown">
          {this.props.locations?.map((l, i) => (
            <button
              key={i}
              className={
                "location " +
                (this.props.currentLocation === i ? "current" : "")
              }
              onClick={() => this.props.changeLocation(i)}
            >
              {l.name}
            </button>
          ))}
        </div>
      </div>
    );
  }
}
