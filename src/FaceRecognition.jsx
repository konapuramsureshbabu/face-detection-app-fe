import React, { useRef, useState,useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { FaCamera, FaUserPlus, FaSignInAlt, FaArrowLeft, FaCheckCircle, FaUser } from 'react-icons/fa';
import './FaceRecognition.css';

const FaceRecognition = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [referenceImage, setReferenceImage] = useState(null);
  const [detectedFaces, setDetectedFaces] = useState([]);
  const [message, setMessage] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/login', new URLSearchParams({
        username,
        password,
      }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      setToken(response.data.access_token);
      setMessage('Logged in successfully');
      setIsSuccess(true);
      setIsError(false);
      setUsername('');
      setPassword('');
    } catch (error) {
      setMessage('Login failed: ' + (error.response?.data?.detail || error.message));
      setIsError(true);
      setIsSuccess(false);
      console.error(error);
    }
  };

  const captureReferenceImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setReferenceImage(imageSrc);
      setMessage('Reference image captured. Ready to register!');
      setIsSuccess(true);
      setIsError(false);
    }
  };

  const handleRegister = async () => {
    if (!referenceImage) {
      setMessage('Please capture a reference image first');
      setIsError(true);
      setIsSuccess(false);
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/register', {
        username,
        password,
        reference_image: referenceImage.split(',')[1],
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      setMessage('Registration successful! Please log in.');
      setIsSuccess(true);
      setIsError(false);
      setIsRegistering(false);
      setUsername('');
      setPassword('');
      setReferenceImage(null);
    } catch (error) {
      setMessage('Registration failed: ' + (error.response?.data?.detail || error.message));
      setIsError(true);
      setIsSuccess(false);
      console.error(error);
    }
  };

  const captureAndDetect = async () => {
    if (!token) {
      setMessage('Please log in first');
      setIsError(true);
      setIsSuccess(false);
      return;
    }
    if (webcamRef.current && canvasRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      try {
        const response = await axios.post('http://localhost:5000/recognize', {
          image: imageSrc.split(',')[1],
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDetectedFaces(response.data.faces);
        setMessage(response.data.message);
        setIsSuccess(true);
        setIsError(false);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3;
        response.data.faces.forEach(face => {
          ctx.strokeRect(face.x, face.y, face.width, face.height);
        });
      } catch (error) {
        setMessage('Error: ' + (error.response?.data?.detail || error.message));
        setIsError(true);
        setIsSuccess(false);
        console.error(error);
      }
    }
  };

  // Snow Flower Effect
useEffect(() => {
  if (window.innerWidth > 480) { // Only create flowers on desktop
    const createSnowFlower = () => {
      const flower = document.createElement('div');
      flower.className = 'snow-flower';
      flower.innerHTML = '❄'; // Snowflake
      // flower.innerHTML = '🌸'; // For sakura petals
      
      // Randomize position and animation
      const leftIni = Math.random() * 100;
      const leftEnd = leftIni + (Math.random() * 20 - 10);
      
      flower.style.setProperty('--left-ini', `${leftIni}vw`);
      flower.style.setProperty('--left-end', `${leftEnd}vw`);
      
      // Randomize size
      const size = Math.random() * 1.5 + 0.5;
      flower.style.fontSize = `${size}rem`;
      
      // Randomize animation duration
      const duration = Math.random() * 10 + 5;
      flower.style.animationDuration = `${duration}s`;
      
      // Randomize delay
      flower.style.animationDelay = `${Math.random() * 5}s`;
      
      document.body.appendChild(flower);
      
      // Remove flower after animation completes
      setTimeout(() => {
        flower.remove();
      }, duration * 1000);
    };
    
    // Create initial flowers
    for (let i = 0; i < 15; i++) {
      setTimeout(createSnowFlower, Math.random() * 5000);
    }
    
    // Create new flowers periodically
    const interval = setInterval(createSnowFlower, 1000);
    
    return () => clearInterval(interval);
  }
}, []);

  return (
    <div className="face-recognition-container">
      <h1 className="face-recognition-title">
        {token ? <><FaUser /> Face Attendance System</> : 'Face Recognition Portal'}
      </h1>
      
      <div className="face-recognition-card">
        {!token ? (
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="face-recognition-input"
            />
            <br />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="face-recognition-input"
            />
            <br />
            
            {isRegistering ? (
              <>
                <div className="webcam-container">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    width={320}
                    height={240}
                    screenshotFormat="image/jpeg"
                   />
                </div>
                
                <button 
                  onClick={captureReferenceImage}
                  className="face-recognition-button secondary"
                >
                  <FaCamera /> Capture Reference
                </button>
                
                {referenceImage && (
                  <div className="reference-image-preview">
                    <img src={referenceImage} alt="Reference" />
                  </div>
                )}
                
                <button 
                  onClick={handleRegister} 
                  disabled={!referenceImage || !username || !password}
                  className="face-recognition-button primary"
                >
                  <FaUserPlus /> Complete Registration
                </button>
                
                <button 
                  onClick={() => setIsRegistering(false)}
                  className="face-recognition-button"
                >
                  <FaArrowLeft /> Back to Login
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleLogin} 
                  disabled={!username || !password}
                  className="face-recognition-button primary"
                >
                  <FaSignInAlt /> Login
                </button>
                
                <button 
                  onClick={() => setIsRegistering(true)}
                  className="face-recognition-button secondary"
                >
                  <FaUserPlus /> Register New User
                </button>
              </>
            )}
            
            {message && (
              <p className={`face-recognition-message ${isError ? 'error' : ''} ${isSuccess ? 'success' : ''}`}>
                {isSuccess && <FaCheckCircle className="message-icon" />}
                {message}
              </p>
            )}
          </div>
        ) : (
          <div>
            <div className="webcam-wrapper">
              <div className="webcam-container">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  width={320}
                  height={240}
                  screenshotFormat="image/jpeg"
                />
                <canvas
                  ref={canvasRef}
                  width={320}
                  height={240}
                  className="canvas-overlay"
                />
              </div>
            </div>
            
            <div>
              <button 
                onClick={captureAndDetect} 
                className="face-recognition-button primary mark-attendance"
              >
                <FaCamera /> Mark Attendance
              </button>
              
              {detectedFaces.length > 0 && (
                <div className="face-count">
                  Detected: {detectedFaces.length} face{detectedFaces.length !== 1 ? 's' : ''}
                </div>
              )}
              
              {message && (
                <p className={`face-recognition-message ${isError ? 'error' : ''} ${isSuccess ? 'success' : ''}`}>
                  {isSuccess && <FaCheckCircle className="message-icon" />}
                  {message}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceRecognition;