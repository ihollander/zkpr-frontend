const adapter = new APIAdapter("https://zkpr.herokuapp.com")

let weatherSet = false

// weather things
document.body.addEventListener("mousemove", setWeatherTheme)

function setWeatherTheme() {
  if (!weatherSet) {
    setInterval(setWeatherTheme, 5 * 60 * 1000) // check every 5 minutes
    weatherSet = true
    document.body.removeEventListener("mousemove", setWeatherTheme)
  }
  navigator.geolocation.getCurrentPosition(function (position) {
    adapter.getWeather(position.coords.latitude, position.coords.longitude)
      .then(weather => document.body.className = weather.icon)
  })
}

/****************  DOM Elements ****************/
const lightSwitch = document.querySelector("#toggle-dark-mode")
const animalForm = document.querySelector("#animal-form")
const animalList = document.querySelector("#animal-list")

/**************** Event Listeners ****************/
lightSwitch.addEventListener("click", handleLightSwitchClick)
animalForm.addEventListener("submit", handleFormSubmit)
animalList.addEventListener("click", e => {
  // Donate button clicked
  if (e.target.dataset.action === "donate") {
    handleDonate(e)
  }

  // Delete button clicked
  if (e.target.dataset.action === "freeToTheWild") {
    handleDelete(e)
  }
})

/**************** Event Handlers ****************/
function handleLightSwitchClick() {
  document.body.classList.toggle("dark-mode")
}

function handleFormSubmit(e) {
  // always prevent the default action for submit events!
  e.preventDefault()

  // get the form input
  const newAnimal = {
    name: e.target["name"].value,
    species_name: e.target["species_name"].value,
    image_url: e.target["image_url"].value,
    description: e.target["description"].value,
    diet: parseInt(e.target["diet"].value),
    donations: 0
  }

  adapter.createAnimal(newAnimal)
    .then(animalObj => {
      // create our animal
      const newAnimal = new Animal(animalObj)
      // slap it on the DOM
      newAnimal.render(animalList)
    })

}

function handleDonate(e) {
  const outerLi = e.target.closest(".card")
  const animalId = parseInt(outerLi.dataset.id)
  const animal = Animal.find(animalId)

  animal.donate()

  adapter.updateAnimal(animalId, animal.donations)
}

function handleDelete(e) {
  const outerLi = e.target.closest(".card")
  const animalId = parseInt(outerLi.dataset.id)
  const animal = Animal.find(animalId)

  adapter.deleteAnimal(animalId)
    .then(() => animal.delete())
}

/**************** Initial Render ****************/
adapter.getAnimals()
  .then(animalsArray => {
    animalsArray.forEach(animalObj => {
      const newAnimal = new Animal(animalObj)
      newAnimal.render(animalList)
    })
  })