import { useState } from "react";
import { Link } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { Squash as Hamburger } from "hamburger-react";
// components
import LocationDropdown from "./LocationDropdown";
import Searchmenu from "./Searchmenu";
// styles
import "../styles/floatingButtons.scss";
// icons
import { GrMapLocation } from "react-icons/gr";
import { AiOutlineReload, AiOutlineSearch } from "react-icons/ai";
import { MdOutlineFeedback } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";

import { MODIFIER_PREFIX } from "../";
import { createNewTable } from "../helpers/tables";

export default function FloatingButtons(props) {
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1000px)" });

  const [toggledOpen, setToggledOpen] = useState(false);
  if (props.forceOpen) setToggledOpen(true);

  return (
    <>
      <div
        id="floatingButtonsContainer"
        onMouseEnter={() => props.setHoverTooltopPosition("left")}
      >
        <div
          id="floatingButtons"
          className={isTabletOrMobile && !toggledOpen ? "hidden" : ""}
        >
          <div
            id="searchContainer"
            data-tip={`Suchen (${MODIFIER_PREFIX}+alt+f)`}
          >
            <button
              className="floatingButton"
              style={{ border: props.searchOpen ? "2px solid #00beff" : "" }}
              onClick={() => {
                props.setlocationDropDownOpen(false);
                props.setSearchOpen(!props.searchOpen);
              }}
            >
              <AiOutlineSearch />
            </button>
          </div>
          <div
            id="changeLocationContainer"
            data-tip={`Location wechseln (${MODIFIER_PREFIX}alt+l)`}
          >
            <button
              className="floatingButton"
              style={{
                border: props.locationDropDownOpen ? "2px solid #00beff" : "",
              }}
              onClick={() => {
                props.setSearchOpen(false);
                props.setlocationDropDownOpen(!props.locationDropDownOpen);
              }}
            >
              <GrMapLocation />
            </button>
          </div>
          <div
            id="addTableContainer"
            data-tip={`Tisch hinzufügen (${MODIFIER_PREFIX}+alt+n)`}
          >
            <button
              className="floatingButton"
              onClick={() =>
                createNewTable(props.currentLocation).then(() =>
                  props.setReloadTables(true)
                )
              }
            >
              <IoMdAdd />
            </button>
          </div>
          <div
            id="refreshButtonContainer"
            data-tip={`Reload (${MODIFIER_PREFIX}+alt+r)`}
          >
            <button
              className="floatingButton"
              style={{
                transform: props.reloadTables
                  ? "rotate(360deg)"
                  : "rotate(0deg)",
                transition: props.reloadTables
                  ? "transform .4s ease-in-out"
                  : "",
              }}
              onClick={(e) => props.setReloadTables(true)}
            >
              <AiOutlineReload />
            </button>
          </div>
          <div id="feedbackButtonContainer" data-tip="Feedback">
            <button
              className="floatingButton"
              onClick={(e) => props.setReloadTables(true)}
            >
              <Link to="/feedback">
                <MdOutlineFeedback />
              </Link>
            </button>
          </div>
        </div>
        <button
          id="toggleButton"
          className={
            "floatingButton " + (isTabletOrMobile ? "visible" : "hidden")
          }
          style={{
            transform: `rotate(${toggledOpen ? 90 : 0}deg)`,
          }}
          onClick={() => {
            if (toggledOpen) {
              props.setSearchOpen(false);
              props.setlocationDropDownOpen(false);
            }
            setToggledOpen(!toggledOpen);
          }}
        >
          <Hamburger toggled={toggledOpen} color="white" />
        </button>
        <LocationDropdown
          open={props.locationDropDownOpen}
          close={() => props.setlocationDropDownOpen(false)}
          locations={props.locations}
          currentLocation={props.currentLocation}
          changeLocation={(id) => props.changeLocation(id)}
        />
        <Searchmenu
          images={props.images}
          close={() => props.setSearchOpen(false)}
          open={props.searchOpen}
          highlightRoom={(name) => props.setHighlightedRoom(name)}
          highlightTable={(id) => props.setHighlightedTable(id)}
          changeLocation={(id) => props.changeLocation(id)}
          overwrite={props.searchOverwrite}
          clearOverwrite={() => props.clearOverwrite(false)}
        />
      </div>
    </>
  );
}
