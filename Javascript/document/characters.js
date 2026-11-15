
import { animeCharacter } from "../data/character-list.js";
import { searchCharacter } from "../function/search-character.js";

// GET URL PARAMETERS
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// GET SELECTED ANIME
const animeId = getUrlParameter("animeId");

const matchingAnimeId = animeCharacter.find(
  (animeChar) => animeChar.id === animeId
);

if (!matchingAnimeId) {
  document.querySelector(".trailer-container").innerHTML =
    "<p>Anime not found.</p>";
} else {

  // GENERATE CHARACTER CARDS
  let characterHTML = "";

  matchingAnimeId.characters.forEach((char) => {
    characterHTML += `
      <div class="character-card">
        <div class="character-thumbnail">
          <img src="${char.thumbnail}" alt="${char.name}">
        </div>
        <div class="character-name">${char.name}</div>
      </div>
    `;
  });

  // GENERATE TRAILER SECTION
  document.querySelector(".trailer-container").innerHTML = `
    <div class="trailer-block">

      <!-- VIDEO -->
      <video
        class="main-video-thumbnail display-none js-video-trailer"
        src="${matchingAnimeId.mainVideo}"
        preload="metadata"
        playsinline>
      </video>

      <!-- ORIGINAL THUMBNAIL -->
      <img
        class="main-image-thumbnail display-block js-image-thumbnail"
        src="${matchingAnimeId.mainThumbnail}"
        alt="Anime thumbnail">

      <!-- VIDEO PROGRESS BAR OVERLAY -->
      <div class="video-progress-container display-none">

        <span class="video-current-time">0:00</span>

        <input
          type="range"
          class="video-progress-bar"
          min="0"
          max="100"
          value="0"
          step="0.1"
          aria-label="Video playback position">

        <span class="video-duration">0:00</span>

      </div>

    </div>

    <!-- ANIME INFORMATION OVERLAY -->
    <div
      class="inner-background"
      style="background: linear-gradient(
        to right,
        ${matchingAnimeId.backgroundColor},
        rgba(255, 255, 255, 0) 70%
      );">

      <div class="thumbnail-text-button-container">

        <img
          class="thumbnail-video"
          src="${matchingAnimeId.textLogo}"
          alt="Anime logo">

        <div class="button-container">

          <button
            type="button"
            class="play-trailer-button js-play-trailer-button">
            ▶ Play Trailer
          </button>

          <a href="#characters" class="anime-characters-button">
            Characters
          </a>

        </div>
      </div>
    </div>
  `;

  // UPDATE ANIME THUMBNAIL
  const newThumbnail = document.getElementById("js-anime-thumbnail");

  if (newThumbnail) {
    newThumbnail.src = matchingAnimeId.animeThumbnail;
  }

  // DISPLAY CHARACTERS
  document.querySelector(".js-character-grid").innerHTML =
    characterHTML;

  searchCharacter();


  // STOP VIDEO WHEN CHARACTERS BUTTON IS CLICKED
  document.querySelector(".anime-characters-button")
    .addEventListener("click", () => {

      const videoTrailer = document.querySelector(".js-video-trailer");
      const imageThumbnail = document.querySelector(".js-image-thumbnail");
      const playButton = document.querySelector(".js-play-trailer-button");
      const progressContainer = document.querySelector(".video-progress-container");
      const progressBar = document.querySelector(".video-progress-bar");
      const currentTimeText = document.querySelector(".video-current-time");

      // Stop and reset video
      videoTrailer.pause();
      videoTrailer.currentTime = 0;

      // Hide video
      videoTrailer.classList.add("display-none");
      videoTrailer.classList.remove("display-block");

      // Show original thumbnail
      imageThumbnail.classList.remove("display-none");
      imageThumbnail.classList.add("display-block");

      // Hide progress bar
      progressContainer.classList.add("display-none");

      // Reset progress
      progressBar.value = 0;
      progressBar.style.setProperty("--progress", "0%");
      currentTimeText.textContent = "0:00";

      // Reset button
      playButton.textContent = "▶ Play Trailer";
    });


  // VIDEO ELEMENTS
  const videoTrailer = document.querySelector(".js-video-trailer");
  const imageThumbnail = document.querySelector(".js-image-thumbnail");
  const playButton = document.querySelector(".js-play-trailer-button");

  const progressContainer = document.querySelector(
    ".video-progress-container"
  );

  const progressBar = document.querySelector(".video-progress-bar");
  const currentTimeText = document.querySelector(".video-current-time");
  const durationText = document.querySelector(".video-duration");

  // FORMAT VIDEO TIME
  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  // UPDATE RED PROGRESS LINE
  function updateProgressColor() {
    progressBar.style.setProperty(
      "--progress",
      `${progressBar.value}%`
    );
  }

  // SHOW VIDEO AND CONTROLS
  function showVideo() {
    videoTrailer.classList.remove("display-none");
    videoTrailer.classList.add("display-block");

    imageThumbnail.classList.remove("display-block");
    imageThumbnail.classList.add("display-none");

    progressContainer.classList.remove("display-none");
  }

  // SHOW ORIGINAL THUMBNAIL
  function showThumbnail() {
    videoTrailer.classList.add("display-none");
    videoTrailer.classList.remove("display-block");

    imageThumbnail.classList.add("display-block");
    imageThumbnail.classList.remove("display-none");

    progressContainer.classList.add("display-none");
  }

  // RESET VIDEO
  function resetVideo() {
    videoTrailer.pause();
    videoTrailer.currentTime = 0;

    progressBar.value = 0;
    updateProgressColor();

    currentTimeText.textContent = "0:00";
    playButton.textContent = "▶ Play Trailer";

    showThumbnail();
  }

  // PLAY / PAUSE BUTTON
  playButton.addEventListener("click", async () => {

    if (videoTrailer.paused) {

      showVideo();

      try {
        await videoTrailer.play();
      } catch (error) {
        console.error("Video playback failed:", error);

        if (videoTrailer.paused) {
          showThumbnail();
          playButton.textContent = "▶ Play Trailer";
        }
      }

    } else {
      videoTrailer.pause();
    }
  });

  // UPDATE BUTTON WHEN VIDEO PLAYS
  videoTrailer.addEventListener("play", () => {
    playButton.textContent = "⏸ Pause Trailer";
  });

  // UPDATE BUTTON WHEN VIDEO PAUSES
  videoTrailer.addEventListener("pause", () => {
    if (!videoTrailer.ended) {
      playButton.textContent =
        videoTrailer.currentTime > 0
          ? "▶ Resume Trailer"
          : "▶ Play Trailer";
    }
  });

  // GET VIDEO DURATION
  videoTrailer.addEventListener("loadedmetadata", () => {
    durationText.textContent = formatTime(videoTrailer.duration);
  });

  // UPDATE PROGRESS WHILE VIDEO PLAYS
  videoTrailer.addEventListener("timeupdate", () => {

    const currentTime = videoTrailer.currentTime;
    const duration = videoTrailer.duration;

    currentTimeText.textContent = formatTime(currentTime);

    if (Number.isFinite(duration) && duration > 0) {
      progressBar.value = (currentTime / duration) * 100;
      updateProgressColor();
    }
  });

  // FORWARD OR REWIND VIDEO
  progressBar.addEventListener("input", () => {

    const duration = videoTrailer.duration;

    if (Number.isFinite(duration) && duration > 0) {
      videoTrailer.currentTime =
        (Number(progressBar.value) / 100) * duration;

      currentTimeText.textContent =
        formatTime(videoTrailer.currentTime);

      updateProgressColor();
    }
  });

  // RESET WHEN VIDEO ENDS
  videoTrailer.addEventListener("ended", resetVideo);

  // HANDLE VIDEO LOADING ERRORS
  videoTrailer.addEventListener("error", () => {
    console.error(
      "Unable to load video:",
      matchingAnimeId.mainVideo
    );

    showThumbnail();
    playButton.textContent = "▶ Play Trailer";
  });

  // INITIAL PROGRESS BAR
  updateProgressColor();
}
