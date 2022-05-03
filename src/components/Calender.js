import "../styles/calender.scss";
import { AiOutlineClose } from "react-icons/ai";

export default function Calender(props) {
  return (
    <>
      <div
        id="calenderBackground"
        className={props.visible ? "open" : ""}
      ></div>
      <div id="calender" className={props.visible ? "visible" : ""}>
        <div id="calenderHeader">
          <h1 style={{ color: props.data?.color }}>{props.data?.name}</h1>
          <button id="calenderClose" onClick={() => props.close()}>
            <AiOutlineClose />
          </button>
        </div>
        <iframe src={props.data?.link}></iframe>
      </div>
    </>
  );
}

// TODO: add titles to all location parts (some rooms have multiple parts bc they are not rectangular, so the title must be on all of them) Maybe have an attribute if the part should have the text on display
