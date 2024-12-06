import "./TypedText.scss";
import { useEffect, useState } from "react";

export default function TypedText() {
  const [textArray, setTextArray] = useState([
    "Frontend developer",
    "Web designer",
    "Photographer",
    "Drone pilot",
  ]);

  useEffect(() => {
    const typeAndDelete = async () => {
      await typeSentence(textArray[0]);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await deleteSentence("sentence");
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setTextArray((prev) => {
        const newArray = prev.slice(1).concat(prev[0]);
        return newArray;
      });
    };

    typeAndDelete();
  }, [textArray]);

  function typeSentence(sentence, elementId = "sentence", delay = 100) {
    document.getElementById(elementId).innerHTML = "";
    const letters = sentence.split("");

    letters.forEach((letter, index) => {
      setTimeout(() => {
        document.getElementById(elementId).innerHTML += letter;
      }, index * delay);
    });
  }

  function deleteSentence(elementId) {
    const delay = 100;
    const sentence = document.getElementById(elementId).innerHTML;
    const letters = sentence.split("");

    letters.forEach((letter, index) => {
      setTimeout(() => {
        letters.pop();
        document.getElementById(elementId).innerHTML = letters.join("");
      }, index * delay);
    });
  }

  return (
    <div className="typed-text">
      <span id="sentence" className="sentence red-text"></span>
      <span className="input-cursor"></span>
    </div>
  );
}
