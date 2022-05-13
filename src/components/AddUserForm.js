import React, { useState } from "react";
import fetch from "sync-fetch";
import { CONFIG } from "../index";
import { AiOutlineClose } from "react-icons/ai";
import User from "./User";
import { addUsersToStorage, fetchUserData } from "../helpers/users";
import { getTeamData } from "../helpers/teams";
import "../styles/addUserForm.scss";

export default function AddUserForm(props) {
  const [users, setUsers] = useState([]);

  const updateUsers = (name) => {
    searchString = name;
    if (name.length < CONFIG.minSearchLengh) {
      setUsers([]);
      return;
    }
    const urlToFetch = process.env.REACT_APP_BACKEND + "getUsersByName/" + name;
    const allUsers = process.env.REACT_APP_BACKEND + "users";
    const newUsers = (
      fetch(name !== "" ? urlToFetch : allUsers).json() || []
    ).map((user) => {
      return {
        ...user,
        teams: user.Organisationseinheiten.split(",")
          .map((team) => team.replace(": Seibert Media (SM)", "").trim())
          .filter((s) => s.length > 0)
          .map((teamName) => getTeamData(teamName)),
      };
    });
    setUsers(newUsers);
    addUsersToStorage(newUsers);
  };

  let searchString = "";

  let noData = "";
  if (searchString.length < CONFIG.minSearchLengh) {
    noData = (
      <div className="noData">
        Mindestens {CONFIG.minSearchLengh} Buchstaben eingeben...
      </div>
    );
  } else if (users.length === 0)
    noData = <div className="noData">Kein Mitarbeiter gefunden</div>;

  return (
    <>
      <div
        id="addUserFormBackground"
        className={props.open ? "open" : ""}
      ></div>
      <div id="addUserForm" className={props.open ? "open" : ""}>
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
                updateUsers(e.target.value);
              }}
            />
            <div id="closeButtonContainer">
              <button onClick={() => props.closePopup()}>
                <AiOutlineClose />
              </button>
            </div>
          </div>
          <div id="selectUser">
            {noData}
            {users.map((user, i) => {
              return (
                <User
                  key={user.id}
                  user={user}
                  deletable={false}
                  clickable={true}
                  getTeam={(name) => props.getTeam(name)}
                  clickHandler={(id) => {
                    props.addUser(id);
                    props.closePopup();
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
