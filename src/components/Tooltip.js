import React from "react";
// import ReactDOM from "react-dom";
import Draggable from "react-draggable";

import User from "./User";
import AddUserForm from "./AddUserForm";

// icons
import { BsTrashFill } from "react-icons/bs";
import { FiMove, FiCheck } from "react-icons/fi";
import { AiOutlineClose } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import { HiUserAdd } from "react-icons/hi";
import { GrPowerReset } from "react-icons/gr";

export default class Tooltip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      addUserFormOpen: false,
    };
    this.myRef = React.createRef();
  }

  render() {
    this.defaultValue = this.props.table?.tableNumber;
    const isDraggable = !this.props.popup
      ? {
          position: {
            x: this.props.table?.x + 80 || 0,
            y: this.props.table?.y - 40 || 0,
          },
        }
      : [];
    const userCount = (
      this.props.table?.user.split(";").filter((s) => s.length > 0) || []
    ).length;

    const hideButton = this.props.currentlyMovingTable
      ? {
          height: 0,
          width: 0,
          overflow: "hidden",
        }
      : {};

    return (
      <>
        <Draggable
          {...isDraggable}
          handle=".drag"
          cancel=".noDragHere"
          defaultClassNameDragging="dragging"
        >
          <div
            ref={this.myRef}
            // id="tooltip"
            className={"drag " + (this.props.popup ? "popup" : "")}
            {...{ id: "tooltip" }}
            style={{
              zIndex:
                this.props.popup || this.state.visible || this.props.visible
                  ? 2
                  : -1,
              position: this.props.popup ? "fixed" : "relative",
              transform: this.props.popup ? "translate(-50%, -50%)" : "",
              transitionDelay:
                this.state.visible || this.props.visible ? "" : " .1s",
              opacity:
                this.props.popup || this.state.visible || this.props.visible
                  ? 1
                  : 0,
            }}
            onMouseEnter={() => this.setState({ visible: true })}
            onMouseLeave={() => this.setState({ visible: false })}
          >
            <form
              action=""
              onSubmit={(e) => {
                e.target.children[0].blur();
                e.preventDefault();
              }}
              key={this.defaultValue}
            >
              <input
                type="text"
                id="tableNumber"
                onChange={(e) => (this.tableNumberInput = e.target.value)}
                defaultValue={this.defaultValue}
                autoComplete="off"
                disabled={!this.props.popup}
                onBlur={(e) => {
                  this.props.changeTableNumber(
                    this.props.table?.id,
                    e.target.value
                  );
                  e.preventDefault();
                }}
              />
            </form>
            <div id="editButtonContainer">
              <button onClick={() => this.props.openPopup()}>
                <FaEdit />
              </button>
            </div>
            <div id="closeButtonContainer">
              <button
                onClick={() => this.props.closePopup()}
                style={hideButton}
              >
                <AiOutlineClose />
              </button>
            </div>
            <div
              key={this.props.table?.r}
              id="inputs"
              className={
                "noDragHere " +
                (this.props.currentlyMovingTable ? "" : "hidden")
              }
            >
              <h3>Tisch drehen / verschieben</h3>
              <input
                type="range"
                defaultValue={this.props.table?.r}
                name="posRinput"
                id="posR"
                min={0}
                max={360}
                onChange={(e) => this.props.spinTable(e.target.value)}
              />
              <h4>Schiebe den Tisch mit der Maus</h4>
            </div>
            <div
              id="usersContainer"
              className={this.props.currentlyMovingTable ? "hidden" : ""}
              style={{
                gridTemplateColumns: userCount > 1 ? "auto auto" : "auto",
                width: userCount < 2 ? 250 : userCount > 4 ? 600 : 420,
                justifyContent: userCount < 3 ? "center" : "flex-start",
              }}
            >
              {(
                this.props.table?.user.split(";").filter((s) => s.length > 0) ||
                []
              ).map((user, i) => {
                const u = this.props.getUser(user);
                return (
                  <div key={i} className="userContainer">
                    <User
                      deletable={true}
                      deleteUser={(userId) => {
                        const users = this.props.table.user.split(";");
                        users.splice(users.indexOf(userId), 1);
                        this.props.table.user = users.join(";");
                        this.props.deleteUser(userId, this.props.table?.id);
                      }}
                      getTeam={(name) => this.props.getTeam(name)}
                      key={i}
                      user={u}
                    />
                  </div>
                );
              }) || <span className="noData">keine Personen</span>}
            </div>
            <div id="controls">
              <button
                id="add"
                className={this.props.currentlyMovingTable ? "hidden " : ""}
                onClick={() => this.setState({ addUserFormOpen: true })}
              >
                <HiUserAdd />
              </button>
              <button
                id="save"
                className={!this.props.currentlyMovingTable ? "hidden " : ""}
                onClick={() => this.props.saveMovedTable()}
              >
                <FiCheck />
              </button>
              <button
                id="move"
                className={this.props.currentlyMovingTable ? "hidden " : ""}
                onClick={() =>
                  this.props.moveTable(this.props.table?.id, {
                    x: this.props.table.x,
                    y: this.props.table.y,
                    r: this.props.table.r,
                  })
                }
              >
                <FiMove />
              </button>
              <button
                id="reset"
                className={!this.props.currentlyMovingTable ? "hidden " : ""}
                onClick={() => this.props.resetMovingTable()}
              >
                <GrPowerReset />
              </button>
              <button
                id="delete"
                className={this.props.currentlyMovingTable ? "hidden " : ""}
                onClick={() => this.props.removeTable(this.props.table?.id)}
              >
                <BsTrashFill />
              </button>
            </div>
          </div>
        </Draggable>
        <AddUserForm
          open={this.state.addUserFormOpen}
          addUser={(userId) => {
            this.props.addUserToTable(this.props.table.id, userId);
            this.props.table.user = this.props.table.user + ";" + userId;
          }}
          getTeam={(name) => this.props.getTeam(name)}
          closePopup={() => {
            this.setState({ addUserFormOpen: false }, this.props.updateTables);
          }}
        />
      </>
    );
  }
}
