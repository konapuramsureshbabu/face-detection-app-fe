import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const FaceRecognition = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [referenceImage, setReferenceImage] = useState(null); // Store reference image
  const [detectedFaces, setDetectedFaces] = useState([]);
  const [message, setMessage] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

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
      setUsername('');
      setPassword('');
    } catch (error) {
      setMessage('Login failed');
      console.error(error);
    }
  };

  const captureReferenceImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setReferenceImage(imageSrc);
      setMessage('Reference image captured. Now register.');
    }
  };

  const handleRegister = async () => {
    if (!referenceImage) {
      setMessage('Please capture a reference image first');
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
      setMessage('Registration successful. Please log in.');
      setIsRegistering(false);
      setUsername('');
      setPassword('');
      setReferenceImage(null);
    } catch (error) {
      setMessage('Registration failed: ' + (error.response?.data?.detail || error.message));
      console.error(error);
    }
  };

  const captureAndDetect = async () => {
    if (!token) {
      setMessage('Please log in first');
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

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        response.data.faces.forEach(face => {
          ctx.strokeRect(face.x, face.y, face.width, face.height);
        });
      } catch (error) {
        setMessage('Error: ' + (error.response?.data?.detail || error.message));
        console.error(error);
      }
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Face Detection & Attendance</h1>
      {!token ? (
        <div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ margin: '5px', padding: '5px' }}
          />
          <br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ margin: '5px', padding: '5px' }}
          />
          <br />
          {isRegistering ? (
            <>
              <div style={{ position: 'relative', width: '320px', height: '240px', margin: '10px auto' }}>
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  width={320}
                  height={240}
                  screenshotFormat="image/jpeg"
                  style={{ position: 'absolute' }}
                />
              </div>
              <button onClick={captureReferenceImage} style={{ margin: '5px' }}>Capture Reference Image</button>
              {referenceImage && <p>Reference image ready</p>}
              <button onClick={handleRegister} style={{ margin: '5px' }}>Register</button>
              <button onClick={() => setIsRegistering(false)} style={{ margin: '5px' }}>Back to Login</button>
            </>
          ) : (
            <>
              <button onClick={handleLogin} style={{ margin: '5px' }}>Login</button>
              <button onClick={() => setIsRegistering(true)} style={{ margin: '5px' }}>Register</button>
            </>
          )}
          <p>{message}</p>
        </div>
      ) : (
        <div style={{ position: 'relative', width: '640px', height: '480px', margin: '0 auto' }}>
          <Webcam
            ref={webcamRef}
            audio={false}
            width={320}
            height={240}
            screenshotFormat="image/jpeg"
            style={{ position: 'absolute' }}
          />
          <canvas
            ref={canvasRef}
            width={320}
            height={240}
            style={{ position: 'absolute' }}
          />
          <br />
          <button onClick={captureAndDetect} style={{ marginTop: '490px' }}>Mark Attendance</button>
          <div>
            <h3>Detected Faces: {detectedFaces.length}</h3>
            <p>{message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaceRecognition;