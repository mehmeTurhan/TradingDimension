import React, { useEffect } from 'react'
import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
    CSS3DRenderer,
    CSS3DObject,
} from "three/addons/renderers/CSS3DRenderer.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { BoxLineGeometry } from 'three/addons/geometries/BoxLineGeometry.js';

let camera, scene, renderer, glRenderer, glScene;
let controls = null;
var id
let tvScriptLoadingPromise;
const TradingComponent = () => {

    useEffect(() => {
        console.log(controls)
        if (controls === null) {
            init()
        }
    }, []);

    function createWidget(name, stock) {
        if (document.getElementById(name) && 'TradingView' in window) {
            new window.TradingView.widget({
                autosize: true,
                symbol: stock,
                interval: "D",
                timezone: "Etc/UTC",
                theme: "light",
                style: "1",
                locale: "en",
                toolbar_bg: "#f1f3f6",
                enable_publishing: false,
                allow_symbol_change: true,
                container_id: name
            });
        }
    }

    function loadWidjet(name, stock) {
        if (!tvScriptLoadingPromise) {
            tvScriptLoadingPromise = new Promise((resolve) => {
                const script = document.createElement('script');
                script.id = 'tradingview-widget-loading-script';
                script.src = 'https://s3.tradingview.com/tv.js';
                script.type = 'text/javascript';
                script.onload = resolve;

                document.head.appendChild(script);
            });
        }
        tvScriptLoadingPromise.then(() => createWidget(name, stock))
    }

    function Element(name, x, y, z, rotation, stock) {
        const div = document.createElement("div");
        div.style.width = "1280px";
        div.style.height = "720px";
        div.style.borderRadius = "20px";
        div.style.backgroundColor = "#fff";
        div.id = name
        loadWidjet(name, stock)

        const object = new CSS3DObject(div);
        object.position.set(x, y, z);
        object.rotation.set(rotation[0], rotation[1], rotation[2]);
        object.scale.set(0.005, 0.005, 0.005);

        return object;
    }

    function init() {
        const container = document.getElementById("container");

        camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            1,
            5000
        );
        camera.position.set(0, 0, 15);

        scene = new THREE.Scene();
        glScene = new THREE.Scene();
        var ambientLight = new THREE.AmbientLight(0x555555);
        glScene.add(ambientLight);

        renderer = new CSS3DRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);

        glRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

        glRenderer.setClearColor('#00A512');
        glRenderer.setPixelRatio(window.devicePixelRatio);
        glRenderer.setSize(window.innerWidth, window.innerHeight);
        glRenderer.domElement.style.zIndex = -1;
        glRenderer.domElement.style.position = "absolute";
        glRenderer.domElement.style.top = 0;

       
        container.appendChild(renderer.domElement);
        renderer.domElement.appendChild(glRenderer.domElement);
        glRenderer.xr.enabled = true;
        const cameraGroup = new THREE.Group();
        cameraGroup.position.set(0, 0, 8); // Set the initial VR Headset Position.

        //When user turn on the VR mode.
        glRenderer.xr.addEventListener("sessionstart", function () {
            glScene.add(cameraGroup);
            cameraGroup.add(camera);
        });
        //When user turn off the VR mode.
        glRenderer.xr.addEventListener("sessionend", function () {
            glScene.remove(cameraGroup);
            cameraGroup.remove(camera);
        });
        container.appendChild(VRButton.createButton(glRenderer));
        const group = new THREE.Group();
        group.add(Element("screen-1", 0, -2, 0, [0, 0, 0], 'NASDAQ:TSLA'));
        group.add(Element("screen-2", 7, -2, 1, [0, -Math.PI * 0.2, 0], 'NASDAQ:AAPL'));
        group.add(Element("screen-3", -7, -2, 1, [0, Math.PI * 0.2, 0], 'VANTAGE:SP500'));
        group.add(Element("screen-4", 0, 2, 0, [Math.PI * 0.08, 0, 0], 'NYSE:BAC'));
        group.add(Element("screen-5", 7, 2, 1, [0, -Math.PI * 0.2, 0], 'NYSE:BA'));
        group.add(Element("screen-6", -7, 2, 1, [0, Math.PI * 0.2, 0], 'AMEX:XLRE'));
        // group.add(new Element("9ubytEsCaS0", -240, 0, 0, -Math.PI / 2));
        scene.add(group);

        controls = new OrbitControls(camera, renderer.domElement);
        controls.rotateSpeed = 4;


        var room = new THREE.LineSegments(
            new BoxLineGeometry(50, 50, 50, 20, 20, 20),
            new THREE.LineBasicMaterial({ color: 'black' })
        );
        glScene.add(room);
        window.addEventListener("resize", onWindowResize);

        // Block iframe events when dragging camera
        // const blocker = document.getElementById("blocker");
        // blocker.style.display = "none";

        // controls.addEventListener("start", function () {
        //     blocker.style.display = "";
        // });
        // controls.addEventListener("end", function () {
        //     blocker.style.display = "none";
        // });
        glRenderer.setAnimationLoop(animate());
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        glRenderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
        id = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
        glRenderer.render(glScene, camera);
    }
    return (
        <div>
            <div id="container"></div>
        </div>
    )
}

export default TradingComponent
