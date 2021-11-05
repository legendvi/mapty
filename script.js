"use strict";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
//Dom Elemetns---------------------------------------------------------------------------
const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");
//-------------------------------------------------------------------------------------------
//Class Workout and child class running and cycling------------------------------------------
class Workout {
  // prettier-ignore
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  clicks = 0;
  date = new Date();
  id = (Date.now() + "").slice(-10);
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.duration = duration;
    this.distance = distance;
  }
  // Descripting for popup and form title
  _setDescription() {
    this.descripton = `${this.type[0].toUpperCase() + this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
  //counts the number of times list element is clicked(Public API Dummy)------------------------
  countClick() {
    this.clicks++;
  }
}
//--------------------------------------------------------------------
//class Running---------------------------------------
class Running extends Workout {
  type = "running";
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }
  calcPace() {
    this.pace = (this.duration / this.distance).toFixed(3);
    return this.pace;
  }
}
//-------------------------------------------------------
//class cycle--------------------------------------------
class Cycling extends Workout {
  type = "cycling";
  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this.calcSpeed();
    this._setDescription();
  }
  calcSpeed() {
    this.speed = (this.distance / (this.duration / 60)).toFixed(3);
  }
}
//----------------------------------------------------------
//objects for Running and Cycling----------------------------------
const run1 = new Running([1, 2], 34, 65, 2);
const cyc1 = new Cycling([7, 8], 45, 34, 5);
console.log(run1, cyc1);
//---------------------------------------------------
//Application Architecture----------------------------------------------------------------------------------------------------
class App {
  #map;
  #mapEvent;
  #mark;
  #workout;
  #workoutsArray = [];
  lat;
  lng;
  localItems;
  constructor() {
    //Gets the current postions of the browser
    this._getPosition();
    //Listens to the submit event of form
    form.addEventListener("submit", this._newWorkout.bind(this));
    //Listens to the changing in select optoin
    inputType.addEventListener("change", this._toggleElevationField);
    //show corresponding Marker when a Form list item is clicked
    containerWorkouts.addEventListener("click", this._moveMarker.bind(this));
    //get Local items if any------------------------------------------------
    this.localItems = this._getLocalStorage();
    //Validate and add the form lists
    if (this.localItems) {
      this.#workoutsArray = this.localItems;
      this.localItems.forEach((element) => this._renderformList(element));
    }
  }
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("Location Blocked or No Internet");
        }
      );
    }
  }
  //Loads Map from Leaflet Library and renders in map div------------------------------------------
  _loadMap(position) {
    let latitude, longitude;
    ({ latitude, longitude } = position.coords);
    const curCoords = `https://www.google.com/maps/@${latitude},${longitude}`;
    // console.log(latitude, longitude);
    console.log(curCoords);
    this.#map = L.map("map").setView([latitude, longitude], 13);

    //   L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
    //     attribution:
    //       '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    //   }).addTo(map);
    L.tileLayer("http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
      maxZoom: 20,
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
    }).addTo(this.#map);

    //   L.marker([latitude, longitude])
    //     .addTo(map)
    //     .bindPopup("A pretty CSS3 popup.<br> Easily customizable.")
    //     .openPopup();
    this.#map.on("click", this._showForm.bind(this));
    if (this.localItems) {
      this.localItems.forEach((element) => this._renderWorkoutMarker(element));
    }
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove("hidden");
    inputDistance.focus();

    ({ lat: this.lat, lng: this.lng } = this.#mapEvent.latlng);
    // this.#mark = L.marker([this.lat, this.lng], {
    //   riseOnHover: true,
    //   title: "Marker",
    // }).addTo(this.#map);
    //   .bindPopup(
    //     L.popup({
    //       autoClose: false,
    //       closeOnClick: false,
    //       maxWidth: 250,
    //       minWidth: 100,
    //       className: "running-popup",
    //     })
    //   )
    //   .setPopupContent("Running");
    // // .openPopup();
  }
  _hideForm() {
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        "";
    form.classList.add("hidden");
    form.style.display = "none";
    setTimeout(() => (form.style.display = "grid"), 1000);
  }
  _toggleElevationField() {
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
  }
  _newWorkout(e) {
    e.preventDefault();
    //Helper Functions to Validate the inputs--------------
    const isNumber = (...inputs) => inputs.every((inp) => Number.isFinite(inp));
    const isPositive = (...inputs) => inputs.every((inp) => inp > 0);
    //Get Data From Form------------------------
    const type = inputType.value;
    const distance = parseFloat(inputDistance.value);
    const duration = parseFloat(inputDuration.value);
    //Validate the data-------------------------

    //If workout running create running object--
    if (type === "running") {
      //Validate the data-------------------------
      const cadence = parseFloat(inputCadence.value);
      if (
        !isNumber(distance, duration, cadence) ||
        !isPositive(distance, duration, cadence)
      ) {
        return alert("This is not a positive Number");
      }

      this.#workout = new Running(
        [this.lat, this.lng],
        distance,
        duration,
        cadence
      );
    }
    //If workout cycling creae cycling object---
    if (type === "cycling") {
      //Validate the data-------------------------
      const elevation = parseFloat(inputElevation.value);

      if (
        !isNumber(distance, duration, elevation) ||
        !isPositive(distance, duration)
      ) {
        return alert("This is not a positive Number");
      }
      this.#workout = new Cycling(
        [this.lat, this.lng],
        distance,
        duration,
        elevation
      );
    }
    //add the objects in workout list-----------
    this.#workoutsArray.push(this.#workout);
    //Render Marker in Map----------------------
    this._renderWorkoutMarker(this.#workout);
    //Show Form List-----------------------------
    this._renderformList(this.#workout);
    //Hides the form again----------------------
    this._hideForm();
    //call function to Store Array in Local Storage----------------------
    this._setLocalStorage();
  }
  //Render list of form elements created--------------------------------------
  _renderformList(workout) {
    let html = `<li class="workout workout--${workout.type}" data-id=${
      workout.id
    }>
    <h2 class="workout__title">${workout.descripton}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"
      }</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>`;
    if (workout.type === "running") {
      html += ` 
    <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.pace}</span>
      <span class="workout__unit">min/km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${workout.cadence}</span>
      <span class="workout__unit">spm</span>
    </div>
  </li>`;
    }
    if (workout.type === "cycling") {
      html += `  
    <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.speed}</span>
      <span class="workout__unit">km/h</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⛰</span>
      <span class="workout__value">${workout.elevation}</span>
      <span class="workout__unit">m</span>
    </div>
  </li>`;
    }
    form.insertAdjacentHTML("afterend", html);
  }
  //Render Marker Popup--------------------------------------------------------
  _renderWorkoutMarker(workout) {
    L.marker(workout.coords, {
      riseOnHover: true,
      riseoffset: 23,
      title: "Marker",
    })
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          autoClose: false,
          closeOnClick: false,
          maxWidth: 250,
          minWidth: 100,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"} ${workout.descripton}`
      )
      .openPopup();
  }
  //Meathod to Move Marker------------------------------------------------------------------------
  _moveMarker(e) {
    // e.preventDefault();
    const clickedElement = e.target.closest(".workout");
    if (!clickedElement) return;
    // console.log(clickedElement);

    const workoutElement = this.#workoutsArray.find(
      (el) => el.id === clickedElement.dataset.id
    );
    // console.log(workoutElement.coords);
    this.#map.setView(workoutElement.coords, 13, {
      animate: true,
      pan: { duration: 1 },
    });
    // Using Public API Dummy--------------------
    workoutElement.countClick();
    // console.log(workoutElement);
  }
  _setLocalStorage() {
    localStorage.setItem("workoutDetails", JSON.stringify(this.#workoutsArray));
  }
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem("workoutDetails"));
    return data;
  }
  //A Public Method to rest the page(use this method on console in the browser on the objec app)
  reset() {
    localStorage.removeItem("workoutDetails");
    location.reload();
  }
}
//object calling APP class------------------------------
const app = new App();
//---------------------------------------------------------------------------------------------------------
