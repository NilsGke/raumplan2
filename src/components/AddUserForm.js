import React from "react";
import fetch from "sync-fetch";
import { CONFIG } from "../index";
import { AiOutlineClose } from "react-icons/ai";
import User from "./User";

export default class AddUserForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userSelected: false,
      users: [],
    };
    this.searchString = "";
  }

  updateUsers(name) {
    this.searchString = name;
    if (name.length < CONFIG.minSearchLengh) {
      this.setState({ users: [] });
      return;
    }
    const urlToFetch = process.env.REACT_APP_BACKEND + "getUsersByName/" + name;
    const allUsers = process.env.REACT_APP_BACKEND + "users";
    const users = (fetch(name !== "" ? urlToFetch : allUsers).json() || []).map(
      (user) => {
        return {
          ...user,
          teams: user.Organisationseinheiten.split(",")
            .map((team) => team.replace(": Seibert Media (SM)", "").trim())
            .filter((s) => s.length > 0)
            .map((teamName) => this.props.getTeam(teamName)),
        };
      }
    );
    this.setState({ users });
  }

  render() {
    let noData = "";
    if (this.searchString.length < CONFIG.minSearchLengh) {
      noData = <div className="noData">Enter more characters...</div>;
    } else if (this.state.users.length === 0)
      noData = <div className="noData">Kein Mitarbeiter gefunden</div>;

    return (
      <>
        <div
          id="addUserFormBackground"
          className={this.props.open ? "open" : ""}
        ></div>
        <div id="addUserForm" className={this.props.open ? "open" : ""}>
          <form
            action=""
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div id="header">
              <input
                type="text"
                name="userNameInput"
                id="userNameInput"
                autoComplete="off"
                placeholder="Name..."
                onChange={(e) => {
                  this.updateUsers(e.target.value);
                }}
              />
              <div id="closeButtonContainer">
                <button onClick={() => this.props.closePopup()}>
                  <AiOutlineClose />
                </button>
              </div>
            </div>
            <div id="selectUser">
              {noData}
              {this.state.users?.map((user, i) => {
                return (
                  <User
                    key={i}
                    user={user}
                    deletable={false}
                    clickable={true}
                    getTeam={(name) => this.props.getTeam(name)}
                    clickHandler={(id) => {
                      this.props.addUser(id);
                      this.props.closePopup();
                      //TODO: add user to popup and close this form
                    }}
                  />
                );
              })}
            </div>
          </form>
        </div>
      </>
    );
  }
}
