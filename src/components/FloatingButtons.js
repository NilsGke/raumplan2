import {
  forwardRef,
  useState,
  useRef,
  useImperativeHandle,
  useEffect,
} from "react";
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

const FloatingButtons = forwardRef((props, ref) => {
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1000px)" });
  const [activeButton, setActiveButton] = useState("");

  const [toggledOpen, setToggledOpen] = useState(false);
  if (props.forceOpen) setToggledOpen(true);

  const locationDropdownRef = useRef();
  const searchmenuRef = useRef();

  useImperativeHandle(ref, () => ({
    openSearchmenu() {
      locationDropdownRef.current.setOpen(false);
      searchmenuRef.current.setOpen(true);
    },
    openLocationDropdown() {
      searchmenuRef.current.setOpen(false);
      locationDropdownRef.current.setOpen(true);
    },
    searchmenuRef,
    locationDropdownRef,
    clearButtonBorders() {
      setActiveButton("");
    },
    toggledOpen,
    setToggledOpen(bool) {
      setToggledOpen(bool);
    },
  }));

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
              style={{
                border:
                  activeButton === "searchmenu" ? "2px solid #00beff" : "",
              }}
              onClick={() => {
                locationDropdownRef.current.setOpen(false);
                searchmenuRef.current.setOpen(!searchmenuRef.current.isOpen);
                setActiveButton(
                  !searchmenuRef.current.isOpen ? "searchmenu" : ""
                );
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
                border:
                  activeButton === "locationDropdown"
                    ? "2px solid #00beff"
                    : "",
              }}
              onClick={() => {
                searchmenuRef.current.setOpen(false);
                locationDropdownRef.current.setOpen(
                  !locationDropdownRef.current.isOpen
                );
                setActiveButton(
                  !locationDropdownRef.current.isOpen ? "locationDropdown" : ""
                );
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
              searchmenuRef.current.setOpen(false);
              locationDropdownRef.current.setOpen(false);
            }
            setToggledOpen(!toggledOpen);
          }}
        >
          <Hamburger toggled={toggledOpen} color="white" />
        </button>
        <LocationDropdown
          ref={locationDropdownRef}
          locations={props.locations}
          currentLocation={props.currentLocation}
          changeLocation={(id) => props.changeLocation(id)}
        />
        <Searchmenu
          ref={searchmenuRef}
          images={props.images}
          highlightRoom={(name) => props.setHighlightedRoom(name)}
          highlightTable={(id) => props.setHighlightedTable(id)}
          changeLocation={(id) => props.changeLocation(id)}
        />
      </div>
    </>
  );
});

FloatingButtons.displayName = "FloatingButtons";
export default FloatingButtons;
