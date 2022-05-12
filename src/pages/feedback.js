import "../styles/feedback.scss";
import { MODIFIER_PREFIX } from "..";
import { useEffect } from "react";

export default function FeedbackApp() {
  useEffect(() => {
    document.title = "Raumplan Feedback";
  }, []);

  return (
    <div id="feedbackContainer">
      <form method="post">
        <fieldset>
          <legend>Umfrage</legend>
          <h3>
            Wie findest du es, dass die default Shortcuts umgeändert wurden? (zb{" "}
            {MODIFIER_PREFIX} F -&gt; Benutzer Finden und nicht
            Browser-suchfunktion){" "}
          </h3>
          <input type="radio" name="egal" id="r1" />
          <label htmlFor="r1">Stört mich nicht</label>
          <br />
          <input type="radio" name="egal" id="r2" />
          <label htmlFor="r2">Ist kacke</label>
        </fieldset>
      </form>
    </div>
  );
}
