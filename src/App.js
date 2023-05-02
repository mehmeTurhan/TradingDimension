import logo from './logo.svg';
import './App.css';
import { Canvas } from '@react-three/fiber'
import { Box, Html, OrbitControls, RoundedBox } from '@react-three/drei'
import * as THREE from 'three';
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js';
import { VRButton, ARButton, XR, Controllers, Hands, XRExperience } from '@react-three/xr'
import { useState } from 'react';
import TradingComponent from './TradingComponent';

function Newbox() {
  const room = new THREE.LineSegments(
    new BoxLineGeometry(10, 10, 10, 10, 10, 10),
    new THREE.LineBasicMaterial({ color: 'black' })
  );

  return <primitive object={room} />
}


function App() {
  const [vrEnbale,setVrEnable]=useState(false)
  return (
    <div>
      <TradingComponent/>
    </div>
  );
}

export default App;
