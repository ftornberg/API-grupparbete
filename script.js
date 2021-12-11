// API-nyckel till NASA.gov: cqHcjOMiva6jiqEeA5G7qbnS0x87ZXraGpvUsp5x
// api-NYCKEL RESERV: G6p9MQdjcnH9FXh1Db1cmYVK9kp3djhwBQFgPsNP

// Gets the current day
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
today = yyyy + '-' + mm + '-' + dd;

// Sets the date inputs to the current day.
document.querySelector("#fromDate").value = today;
document.querySelector("#toDate").value = today;

// Changes the date inputs from visible to not visibile to half visible
var radios = document.querySelectorAll('input[type=radio][name="val"]');
radios.forEach(radio => radio.addEventListener('change', () => hideDateBars()));

function hideDateBars() {
    let checkedRadioButton = document.querySelector('input[name="val"]:checked').value;
    switch (checkedRadioButton) {
        case "APOD":
            // From and To
            document.querySelector("#fromDateLabel").classList.remove("invisible")
            document.querySelector("#fromDate").classList.remove("invisible")
            document.querySelector("#toDateLabel").classList.remove("invisible")
            document.querySelector("#toDate").classList.remove("invisible")
            break;
        case "NEO":
            //From
            document.querySelector("#fromDateLabel").classList.add("invisible")
            document.querySelector("#fromDate").classList.remove("invisible")
            document.querySelector("#toDateLabel").classList.add("invisible")
            document.querySelector("#toDate").classList.add("invisible")
            break;
        case "CR":
            // From
            document.querySelector("#fromDateLabel").classList.add("invisible")
            document.querySelector("#fromDate").classList.remove("invisible")
            document.querySelector("#toDateLabel").classList.add("invisible")
            document.querySelector("#toDate").classList.add("invisible")
            break;
        case "EONET":
            // None
            document.querySelector("#fromDateLabel").classList.add("invisible")
            document.querySelector("#fromDate").classList.add("invisible")
            document.querySelector("#toDateLabel").classList.add("invisible")
            document.querySelector("#toDate").classList.add("invisible")
            break;
        default:
            break;
    }
}

function getFromNasa() {
    let apiButton = document.querySelector('input[name="val"]:checked').value;
    document.querySelector("#picture").innerHTML = "";

    // Creates a div to show the loading animation
    document.querySelector("#loader").innerHTML = "<p><div class='loading' id='loader'></div><div class='loadingtext'>Loading content...</div></p>";

    let xhr = new XMLHttpRequest();

    let fromDate = document.querySelector("#fromDate").value;
    let toDate = document.querySelector("#toDate").value;

    // Variables used to create the request url for the api
    let apiKey = "cqHcjOMiva6jiqEeA5G7qbnS0x87ZXraGpvUsp5x";
    let apiUrl = "";
    let urlArguments = "";
    let url = "";

    // Creates API url depending on choice
    switch (apiButton) {
        case "APOD":
            apiUrl = "https://api.nasa.gov/planetary/apod?";
            urlArguments = "start_date=" + fromDate + "&end_date=" + toDate + "&api_key=" + apiKey;
            url = apiUrl + urlArguments;
            break;
        case "NEO":
            apiUrl = "https://api.nasa.gov/neo/rest/v1/feed?";
            urlArguments = "start_date=" + fromDate + "&end_date=" + fromDate + "&api_key=" + apiKey;
            url = apiUrl + urlArguments;
            break;
        case "CR":
            apiUrl = "https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?page=1";
            urlArguments = "&earth_date=" + fromDate + "&camera=NAVCAM" + "&api_key=" + apiKey;
            url = apiUrl + urlArguments;
            break;
        case "EONET":
            apiUrl = "https://eonet.gsfc.nasa.gov/api/v2.1/events?";
            urlArguments = "limit=10";
            url = apiUrl + urlArguments;
            break;
        default:
            break;
    }

    xhr.open("GET", url);

    xhr.responseType = "json";

    // Displays all content
    xhr.onload = function () {
        document.querySelector("#invisible").classList.remove("invisible")
        let elementsToPost = "";

        // Check if request has been successfully completed
        if (xhr.status === 200) {

            switch (apiButton) {
                case "APOD":
                    for (let i = 0; i < xhr.response.length; i++) {
                        elementsToPost += '<h2>' + xhr.response[i].title + '</h2>';
                        elementsToPost += '<p>' + xhr.response[i].explanation + '</p>'

                        // If there is a video or an image
                        if (xhr.response[i].media_type == "video") {
                            elementsToPost += '<iframe src="' + xhr.response[i].url + '"width=100% height=100%></iframe>';
                        } else {
                            elementsToPost += '<img src="' + xhr.response[i].url + '"width=100%>';
                            if (xhr.response[i].copyright) {
                                elementsToPost += '<p>&copy;&nbsp;' + xhr.response[i].copyright + '</p>';
                            }
                        }
                    }
                    break;
                case "NEO":
                    elementsToPost += "<h2>Potentially hazardous near earth objects for this date when its at its closest distance to earth in its orbit: " + fromDate + "</h2>"
                    let dooms = 0;
                    for (let i = 0; i < xhr.response.near_earth_objects[fromDate].length; i++) {
                        const x = xhr.response.near_earth_objects[fromDate][i];
                        if (x.is_potentially_hazardous_asteroid) {
                            let closestTime = x.close_approach_data[0].close_approach_date_full.split(' ').pop();
                            elementsToPost += "<h3>" + x.name + "</h3>"
                            elementsToPost += "<ul>"
                            elementsToPost += "<li><b>DiameterMin: </b>" + Math.round(x.estimated_diameter.meters.estimated_diameter_min) + "m</li>"
                            elementsToPost += "<li><b>DiameterMax: </b>" + Math.round(x.estimated_diameter.meters.estimated_diameter_max) + "m</li>"
                            elementsToPost += "<li><b>Speed: </b>" + Math.round(x.close_approach_data[0].relative_velocity.kilometers_per_second) + "km/s</li>"
                            elementsToPost += "<li><b>Distance from earth: </b>" + Math.round(x.close_approach_data[0].miss_distance.kilometers) + "km</li>"
                            elementsToPost += "<li><b>Time closest to earth: </b>" + closestTime + "</li>"
                            elementsToPost += "<li><b>Orbits: </b>" + x.close_approach_data[0].orbiting_body + "</li>"
                            elementsToPost += "</ul>"
                            dooms++
                        }
                    }
                    if (dooms < 1 && fromDate == today) {
                        elementsToPost += "<p>Luckily the world won't end today!</p>"
                    } else if (dooms < 1 && fromDate < today) {
                        elementsToPost += "<p>The world obviously didn't end on this date!</p>"
                    } else if (dooms < 1 && fromDate > today) {
                        elementsToPost += "<p>Luckily the world won't end on this day!</p>"
                    }
                    break;
                case "CR":
                    // Builds rover document
                    elementsToPost += '<p><h2>Images from: ' + xhr.response.photos[0].rover.name + '</h2>';
                    elementsToPost += 'Launch date: ' + xhr.response.photos[0].rover.launch_date + '<br>';
                    elementsToPost += 'Landing date: ' + xhr.response.photos[0].rover.landing_date + '<br></p>';
                    elementsToPost += '<p>Days on Mars: ' + xhr.response.photos[0].sol + '<br>';
                    elementsToPost += 'Status: ' + xhr.response.photos[0].rover.status + '</p>';
                    elementsToPost += '<p><h3>' + xhr.response.photos[0].camera.full_name + ' ' + xhr.response.photos[0].earth_date + '</h3></p>';

                    // For-loop through all images
                    for (let i = 0; i < xhr.response.photos.length; i++) {
                        elementsToPost += '<img src="' + xhr.response.photos[i].img_src + '"width=100%>';
                    }

                    break;
                case "EONET":
                    elementsToPost += "<h2>The 10 most recent natural events registered with NASA</h2>"

                    // Builds Earth Observatory Event Tracker document
                    for (let i = 0; i < xhr.response.events.length; i++) {
                        var responsApi = xhr.response.events[i];
                        var picId = xhr.response.events[i].categories[0].id
                        elementsToPost += "<h2>Title: " + responsApi.title + "</h2>";
                        elementsToPost += "<img class='imgDisasters' src='Images/pic" + picId + ".jpg'>";
                        elementsToPost += "<h3>Type of event: " + responsApi.categories[0].title + "</h3>";
                        elementsToPost += "<h3>Sources: </h3>";

                        // Puts out the links for every event
                        for (let i = 0; i < responsApi.sources.length; i++) {
                            const element = responsApi.sources[i];
                            elementsToPost += "<p class='pNatureDisaster'><a href='" + element.url + "'>" + element.id + "</a></p>";
                        }
                    }
                    break;
                default:
                    break;
            }
            // Posts error message if api request failed
        } else {
            elementsToPost += "<p>Error message: " + xhr.status + xhr.statusText + "</p><iframe src='https://streamable.com/shil2'></iframe>";
        }
        // Creates the elements based on the contents of elementsToPost
        document.querySelector("#picture").innerHTML = elementsToPost;
        setTimeout(() => {
            document.querySelector("#loader").innerHTML = ""
        }, 5000);
    }
    xhr.send();
}