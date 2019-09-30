<img src="https://travisfranklin.github.io/FEND-Project5/img/logo.svg" alt="gourmet logo" width="200px">
The Consummate Culinary Collection for Caloric Connoisseurs

# Udacity FEND Project 5: Restaurant Reviews

This project tests everything I have learned in the past 3 months of my studies in the front-end-nanodegree program. Here's a breakdown of the features!

### ES6 Syntax

This web app utilizes modern ES6 syntax for it's Javascript.

### Responsive Design

This web app is built to responsively resize itself to any device on which it is used. It has been tested to function on the most popular phones and tablets on the market as well as traditional desktop resolutions.

| Desktop | iPad | iPhone |
:--------:|:----:|:-------:
<img src="https://travisfranklin.github.io/FEND-Project5/img/desktop.png" alt="desktop"> | <img src="https://travisfranklin.github.io/FEND-Project5/img/ipad.png" alt="ipad"> | <img src="https://travisfranklin.github.io/FEND-Project5/img/iphone.png" alt="iphone">

On top of this, I've implemented a system for serving images that are the most appropriate for their size in the context of where they're being served.

### API Handling

This web app utilizes [Mapbox's API](https://docs.mapbox.com/api/) along with [Leaflet JS](https://leafletjs.com/) for displaying styled fully-interactive maps on its pages.

If the user attempts to visit the site offline, the site will detect their lack of access to the map's api and replace the map's content dynamically.

<img src="https://travisfranklin.github.io/FEND-Project5/img/mapdisconnect.png" alt="map disconnect" width="300px">

### A11y

This web app implements the latest accessibility standards provided to us by [W3C](https://www.w3.org/standards/webdesign/accessibility). It has been blind-tested for useability with screenreaders.

### Service Workers

This web app caches requests to the site's assets. Not only does this allow the site to load much more quickly when one re-visits pages, if no connection is available, a majority of the site will load normally sans content that requires api access.

---

## Site Installation

1. In your terminal, navigate to the directory you would like this project to be placed in, and clone the project by running this command:

```git clone git@github.com:travisfranklin/FEND-Project5.git```

2. This project required several url adjustments across different files to function properly on github pages that will need to be changed prior to firing up your server. Lucky for you, I've made it easy. If you're on a Unix system, just CD into the project directory and go ahead and run this terminal command:

```perl -pi -w -e 's/\/FEND-Project5//g;' js/*.js```

After that, type `cd js` and run the command again.

3. You can now start up a simple HTTP server to serve up the site files on your local computer. Python has some simple tools to do this, and you don't even need to know Python. For most people, it's already installed on your computer.

    * In a terminal, check the version of Python you have: `python -V`. If you have Python 2.x, spin up the server with `python -m SimpleHTTPServer 8000` (or some other port, if port 8000 is already in use.) For Python 3.x, you can use `python3 -m http.server 8000`. If you don't have Python installed, navigate to Python's [website](https://www.python.org/) to download and install the software.

    * Note -  For Windows systems, Python 3.x is installed as `python` by default. To start a Python 3.x server, you can simply enter `python -m http.server 8000`.
    
4. With your server running, visit the site: `http://localhost:8000`, and look around for a bit to see what the current experience looks like.

---

## Resources

* Images provided by [Udacity](http://www.Udacity.com)
* Logo design by me _(yay)_
* SVG optimization provided by [Jake Archibald's SVGOMG](https://jakearchibald.github.io/svgomg/)
* [Mapbox](https://mapbox.com/)
* [Leaflet JS](https://leafletjs.com/)
* Special thanks to [Matt Gaunt](https://www.gauntface.com/blog/) for his [Service Workers Guide](https://developers.google.com/web/fundamentals/primers/service-workers/)
* Special thanks to [Alexandro Perez](https://github.com/AlexandroPerez) for his [Project Guide](MWS Restaurant Reviews Project). It definitely helped me get out of a couple sticky situations.
