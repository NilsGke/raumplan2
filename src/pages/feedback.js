import "../styles/feedback.scss";
import { MODIFIER_PREFIX } from "..";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function FeedbackApp() {
  // state for name, email and message
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    document.title = "Raumplan Feedback";
  }, []);

  // handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    // validate input
    if (name === "" || email === "" || message === "") {
      alert("Bitte alle Felder ausfüllen!");
      return;
    }
    // send name, email and message to server
    fetch(process.env.REACT_APP_BACKEND + "submitFeedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        message,
      }),
    }).then((res) => {
      if (res.status === 200) {
        alert("Feedback wurde erfolgreich übermittelt. Vielen Dank!");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        alert(
          "Feedback konnte nicht übermittelt werden. Bitte kontaktieren Sie uns per Mail: n.j.goeke@gmail.com"
        );
      }
    });
  };

  return (
    <div id="feedbackContainer">
      <div id="feedbackForm">
        <h1>Feedback</h1>
        <p>Bitte geben Sie Ihre Meldungen an uns.</p>
        <form onSubmit={(e) => handleSubmit(e)}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="message">Nachricht</label>
            <br />
            <textarea
              className="form-control"
              id="message"
              rows="3"
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary">
            Absenden
          </button>
        </form>
      </div>
      <div id="backToMain">
        {/* create a link to main page */}
        <Link to="/">
          <button>Zurück zur Hauptseite</button>
        </Link>
      </div>
    </div>
  );
}
