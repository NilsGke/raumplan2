import "../styles/feedback.scss";
import { MODIFIER_PREFIX } from "..";
import { useEffect } from "react";

export default function FeedbackApp() {
  useEffect(() => {
    document.title = "Raumplan Feedback";
  }, []);

  return <div id="feedbackContainer"></div>;
}
