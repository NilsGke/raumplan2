import history from "../helpers/history";

function History(props) {
  return (
    <div id="historyPopup">
      <div id="historyHeader">
        <h3>History</h3>
        <button
          className="closeButton"
          onClick={() => {
            props.setToggledOpen(false);
          }}
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
}

export default History;
