#ibm
The Dynamic Weather Dashboard is a real-time, location-based weather application.
It fetches and displays temperature, conditions, 5-day forecast, and travel safety advisory using weather APIs.
The dashboard is designed with a simple and interactive interface to enhance user convenience and assist in daily and travel planning.

🏗️ Architecture Flow

User → Browser (HTML, CSS, JS) → OpenWeather API → Weather Data → Dashboard Output

User enters a city name or allows location access.

Application fetches current weather + forecast from OpenWeather API.

Safety evaluation rules classify conditions as SAFE, CAUTION, or WARNING.

Dashboard updates UI with weather details + travel advisory.

Results deployed via Vercel for fast, reliable access.

⚙️ Tech Stack

Frontend:
HTML5 – Structure
CSS3 – Styling and responsive design
JavaScript (ES6+) – Logic, API handling, UI updates

APIs & Data:
OpenWeather API – Real-time weather & forecast
Navigator Geolocation API – Fetches user location

Deployment & Version Control:
Vercel – Hosting & deployment
GitHub – Source code management

Tools:
VS Code – Development
Git – Version control
Browser DevTools – Debugging

🚀 Deployed Link

👉 https://ibm-delta.vercel.app/
