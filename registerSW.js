if('serviceWorker' in navigator) {window.addEventListener('load', () => {navigator.serviceWorker.register('/face-detection-app-fe/sw.js', { scope: '/face-detection-app-fe/' })})}