// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useEffect } from 'react';
import * as config from '../../config';

// import Chat from '../chat/Chat.jsx';

// Styles
import './VideoPlayer.css';

const VideoPlayer = () => {
  const maxMetaData = 10;

  useEffect(() => {
    let metaData = []
    const mediaPlayerScriptLoaded = () => {
      // This shows how to include the Amazon IVS Player with a script tag from our CDN
      // If self hosting, you may not be able to use the create() method since it requires
      // that file names do not change and are all hosted from the same directory.
      
      const MediaPlayerPackage = window.IVSPlayer;
      const quizEl = document.getElementById("quiz");
      const waitMessage = document.getElementById("waiting");
      const questionEl = document.getElementById("question");
      const answersEl = document.getElementById("answers");
      const cardInnerEl = document.getElementById("card-inner");
  
      // First, check if the browser supports the Amazon IVS player.
      if (!MediaPlayerPackage.isPlayerSupported) {
          console.warn("The current browser does not support the Amazon IVS player.");
          return;
      }
  
      const PlayerState = MediaPlayerPackage.PlayerState;
      const PlayerEventType = MediaPlayerPackage.PlayerEventType;
  
      // Initialize player
      const player = MediaPlayerPackage.create();
      player.attachHTMLVideoElement(document.getElementById("video-player"));
  
      // Attach event listeners
      player.addEventListener(PlayerState.PLAYING, () => {
          console.log("Player State - PLAYING");
      });
      player.addEventListener(PlayerState.ENDED, () => {
          console.log("Player State - ENDED");
      });
      player.addEventListener(PlayerState.READY, () => {
          console.log("Player State - READY");
      });
      player.addEventListener(PlayerEventType.ERROR, (err) => {
          console.warn("Player Event - ERROR:", err);
      });
      player.addEventListener(PlayerEventType.TEXT_METADATA_CUE, (cue) => {
          // console.log('Timed metadata: ', cue.text);
          // const metadataText = JSON.parse(cue.text);
          // const productId = metadataText['productId'];
          // const metadataTime = player.getPosition().toFixed(2);

          // // only keep max 5 metadata records
          // if (metaData.length > maxMetaData) {
          //   metaData.length = maxMetaData;
          // }
          // // insert new metadata
          // metaData.unshift(`productId: ${productId} (${metadataTime}s)`);
          const metadataText = cue.text;
          const position = player.getPosition().toFixed(2);
          console.log(
            `Player Event - TEXT_METADATA_CUE: "${metadataText}". Observed ${position}s after playback started.`
          );
          triggerQuiz(metadataText);
      });
  
      // Setup stream and play
      player.setAutoplay(true);
      player.load(config.PLAYBACK_URL);
      player.setVolume(1.0);
      player.setMuted(false);

      function removeCard() {
        quizEl.classList.toggle("drop");
      }

      // Trigger quiz
      function triggerQuiz(metadataText) {
        let obj = JSON.parse(metadataText);

        quizEl.style.display = "";
        quizEl.classList.remove("drop");
        waitMessage.style.display = "none";
        cardInnerEl.style.display = "none";
        cardInnerEl.style.pointerEvents = "auto";

        while (answersEl.firstChild) answersEl.removeChild(answersEl.firstChild);
        questionEl.textContent = obj.question;

        let createAnswers = function (obj, i) {
          let q = document.createElement("a");
          let qText = document.createTextNode(obj.answers[i]);
          answersEl.appendChild(q);
          q.classList.add("answer");
          q.appendChild(qText);

          q.addEventListener("click", (event) => {
            console.log("click event");
            cardInnerEl.style.pointerEvents = "none";
            if (q.textContent === obj.answers[obj.correctIndex]) {
              console.log("correct");
              q.classList.toggle("correct");
            } else {
              console.log("wrong");
              q.classList.toggle("wrong");
            }

            //저장 - 테스트중..
            // const data = `{
            //   "action": "sendmessage",
            //   "data": "${q.textContent}",
            //   "type": "p"
            // }`;
            // console.log(data);

            setTimeout(function () {
              removeCard();
              waitMessage.style.display = "";
            }, 1050);
            return false;
          });
        };

        for (var i = 0; i < obj.answers.length; i++) {
          createAnswers(obj, i);
        }
        cardInnerEl.style.display = "";
      }

      waitMessage.style.display = "";
    }
    const mediaPlayerScript = document.createElement("script");
    mediaPlayerScript.src = "https://player.live-video.net/1.7.0/amazon-ivs-player.min.js";
    mediaPlayerScript.async = true;
    mediaPlayerScript.onload = () => mediaPlayerScriptLoaded();
    document.body.appendChild(mediaPlayerScript);
  }, []);
  
  return (
    <div className="player-wrapper">
      <div className="aspect-169 pos-relative full-width full-height">
        <video id="video-player" className="video-elem pos-absolute full-width" controls playsInline></video>
      </div>
    </div>
  )
}

export default VideoPlayer;
