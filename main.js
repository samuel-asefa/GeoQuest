const countries = [
    { id: "FR", name: "France" },
    { id: "US", name: "United States" },
    { id: "BR", name: "Brazil" },
  ];
  
  let currentCountry = null;
  
  function pickRandomCountry() {
    currentCountry = countries[Math.floor(Math.random() * countries.length)];
    document.getElementById("target-country").textContent = currentCountry.name;
  }
  
  function handleCountryClick(event) {
    const clickedCountryId = event.target.id;
  
    if (!clickedCountryId) return;
  
    const resultBox = document.getElementById("result-box");
    if (clickedCountryId === currentCountry.id) {
      resultBox.textContent = "Correct! Moving to the next country.";
      resultBox.style.color = "green";
      pickRandomCountry();
    } else {
      resultBox.textContent = "Incorrect. Try again.";
      resultBox.style.color = "red";
    }
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    pickRandomCountry();
    const map = document.getElementById("world-map").contentDocument;
    map.addEventListener("click", handleCountryClick);
  });
  