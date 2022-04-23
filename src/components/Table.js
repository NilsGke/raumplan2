import React from "react";
// const fetch = require("sync-fetch");

export default class Table extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userData: false,
      data: this.props.data,
    };
  }

  fetchUsers(userIDs) {
    const users = userIDs
      // .map((id) => fetch(process.env.REACT_APP_BACKEND + "users/" + id).json())
      .map((id) => this.props.getUser(id))
      .flat()
      .map((user) => {
        return {
          ...user,
          teams: user.Organisationseinheiten.split(", ")
            .map((teamName) =>
              this.props.getTeam(
                teamName.replace(": Seibert Media (SM)", "").trim()
              )
            )
            .flat(),
        };
      });

    this.setState({ userData: users }, () => {
      this.props.changeTooltipData(this.props.data, this.state.userData);
    });
  }

  render() {
    return (
      <div
        className="table"
        onClick={() => {
          this.props.popup();
        }}
        style={{
          height: this.props.height + "px",
          width: this.props.width + "px",
          fontSize: this.props.fontSize,
          top: this.props.data.y,
          left: this.props.data.x,
          transform: this.props.moving
            ? `rotate(${this.props.newRotation}deg)`
            : `rotate(${this.props.data.r}deg)`,
          background: this.state.user,
        }}
        onMouseEnter={() => {
          if (this.props.popupOpen) return;
          this.props.tooltip(true);
          if (!this.state.userData) {
            this.fetchUsers(
              this.props.data.user.split(";").filter((s) => s.length > 0)
            );
          } else {
            this.props.changeTooltipData(this.props.data, this.state.userData);
          }
        }}
        onMouseLeave={() => {
          this.props.tooltip(false);
        }}
      >
        {this.props.data.tableNumber.substr(-3, 3)}
      </div>
    );
  }
}
