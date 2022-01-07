import * as THREE from './build/three.module.js';
import { OrbitControls } from './js/OrbitControls.js';
import { GLTFLoader } from './js/GLTFLoader.js';
import { Water } from './js/Water2.js';
import { TWEEN } from './js/tween.module.min.js';
import { DRACOLoader } from './js/DRACOLoader.js';

let mixer;

const clock = new THREE.Clock();
const container = document.getElementById('container');
var mouseposX, mouseposY;
var tagList = [[
	"shui",
	"tu",
	"jin"], [
	-1.6, 1.2, -3.7,
	1.2, 1.6, -0.2,
	0, 1.3, 2.4]];
var tags = [];
let water;
const params = {
	color: '#6495ED',//8B4513 6495ED 556B2F
	scale: 2,
	flowX: -0.2,
	flowY: 0.2
};

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
//开启阴影效果
renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// renderer.shadowIntensity = 10;
container.appendChild(renderer.domElement);

//创建场景
const scene = new THREE.Scene();

//Sky
const path = 'textures/skybox/';
const format = '.jpg';
const urls = [
	path + 'px' + format, path + 'nx' + format,
	path + 'py' + format, path + 'ny' + format,
	path + 'pz' + format, path + 'nz' + format
];
const reflectionCube = new THREE.CubeTextureLoader().load(urls);
const refractionCube = new THREE.CubeTextureLoader().load(urls);
refractionCube.mapping = THREE.CubeRefractionMapping;
scene.background = reflectionCube;

//创建相机，参数为（FOV，视锥体的长宽比，near, far），设置位置
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 150);
camera.position.set(6, 4, 4);
// camera.position.set(-5, 120, -0.01);

const controls = new OrbitControls(camera, renderer.domElement);
// 缩放范围controls.minZoom =0.5;controls.maxZoom =2;
controls.target.set(0, 0, 0);
controls.update();
controls.enablePan = false;//禁止右键拖拽
controls.enableDamping = true;
controls.minPolarAngle = Math.PI * 0.15;//.25
controls.maxPolarAngle = Math.PI * 0.40; 0.45
controls.rotateSpeed = 0.6;
controls.minDistance = 2;
controls.maxDistance = 40;

//环境光
scene.add(new THREE.HemisphereLight(0x7D7D7D, 0x000000, 1.4));
// scene.add(new THREE.HemisphereLight(0x000000, 0x000000, 20));

//平行光
const dirLight = new THREE.DirectionalLight(0xFFF4D6, 2);
dirLight.position.set(25, 25, 0);

// dirLight.rotation.set(0.1, 0.1, 0.1);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 220;
dirLight.shadow.mapSize.height = 220;
dirLight.shadow.camera.left = -10;
dirLight.shadow.camera.right = 10;
dirLight.shadow.camera.top = -10;
dirLight.shadow.camera.bottom = 10;
dirLight.shadow.camera.near = 5;
dirLight.shadow.camera.far = 80;
scene.add(dirLight);

// const dirLight1 = new THREE.DirectionalLight(0xFFF4D6, -1);
// dirLight1.position.set(25, 25, 0);
// scene.add(dirLight1);

// var helper = new THREE.CameraHelper(dirLight.shadow.camera);
// scene.add(helper);// dirLight.shadowCameraNear = 1;

//设置解压库文件路径
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('js/draco/gltf/');
//加载模型
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

loader.load('models/Elephant_anim_01-processed.glb', function (gltf) {
	const model = gltf.scene;
	model.traverse(function (child) {
		if (child.isMesh) {
			if (child.name.startsWith("grass1")) {
				child.castShadow = true;
			}
			if (child.name.startsWith("bush")) {
				child.castShadow = true;
			}
			if (child.name.startsWith("FernB")) {
				child.castShadow = true;
			}
			if (child.name.startsWith("shuzhuang")) {
				child.castShadow = true;
				child.receiveShadow = true;
			}
			if (child.name.startsWith("ground")) {
				// child.castShadow = true;
				child.receiveShadow = true;
			}
			// child.castShadow = true;
			child.material.side = THREE.DoubleSide;
		}
	});
	model.scale.set(1, 1, 1);
	// model.rotation.x = Math.PI * - 0.5;
	model.name = "model";
	scene.add(model);

	//water
	const waterGeometry = new THREE.PlaneBufferGeometry(11, 11);
	water = new Water(waterGeometry, {
		color: params.color,
		scale: params.scale,
		flowDirection: new THREE.Vector2(params.flowX, params.flowY),
		textureWidth: 1024,
		textureHeight: 1024
	});
	water.position.y = 0.36;
	water.position.x = 0.2;
	water.rotation.x = Math.PI * - 0.5;
	scene.add(water);


	// 切换镜头近景 慢镜头效果 （新的相机点，新的目标点）
	// animateCamera(new THREE.Vector3(-8, 3, -8), new THREE.Vector3(0, 0, 0), 3000);
}, undefined, function (e) {
	console.error(e);
});
loader.load('models/Crocodile-processed.glb', function (gltf) {
	const model = gltf.scene;
	model.position.set(-1.5, -0.2, -1.5);
	controls.target.set(model.position.x, model.position.y, model.position.z);


	model.rotation.set(0, Math.PI * -0.3, 0);
	model.scale.set(1, 1, 1);
	// model.rotation.x = Math.PI * - 0.5;
	model.name = "model";
	scene.add(model);

	// 切换镜头近景 慢镜头效果 （新的相机点，新的目标点）
	// animateCamera(new THREE.Vector3(-8, 3, -8), new THREE.Vector3(0, 0, 0), 3000);
}, undefined, function (e) {
	console.error(e);
});

// var cube = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xffffff }));
// cube.position.set(0, 2, 0);
// cube.name = "cube";
// cube.castShadow = true;
// // cube.visible = false;
// scene.add(cube);

// var cube1 = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 1, 10), new THREE.MeshStandardMaterial({ color: 0xffffff }));
// cube1.position.set(0, -1, 0);
// cube1.name = "cube1";
// cube1.receiveShadow = true;
// // cube.visible = false;
// scene.add(cube1);

document.addEventListener("mousedown", function (event) {
	mouseposX = event.clientX;
	mouseposY = event.clientY;
});

document.addEventListener('click', initRay);

animate();

window.onresize = function () {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
};


function animate() {
	requestAnimationFrame(animate);

	TWEEN.update()

	const delta = clock.getDelta();

	// mixer.update(delta);
	for (var i = 0; i < tagList[0].length; i++) {
		if (tags[i] != null)
			tags[i].lookAt(camera.position);
	}


	controls.update();
	renderer.render(scene, camera);
}

// 射线拾取
function initRay(event) {

	if (mouseposX != event.clientX || mouseposY != event.clientY) {
		// console.log("grag not click");
		return;
	}

	// 获取画布
	let mainCanvas = document.querySelector("#container");

	// 将屏幕坐标转为标准设备坐标(支持画布非全屏的情况)
	let x = ((event.clientX - mainCanvas.getBoundingClientRect().left) / mainCanvas.offsetWidth) * 2 - 1;   // 设备横坐标
	let y = -((event.clientY - mainCanvas.getBoundingClientRect().top) / mainCanvas.offsetHeight) * 2 + 1;  // 设备纵坐标
	let standardVector = new THREE.Vector3(x, y, 1);                                                        // 设备坐标

	// 标准设备坐标转为世界坐标
	let worldVector = standardVector.unproject(camera);

	// 射线投射方向单位向量(worldVector坐标减相机位置坐标)
	let ray = worldVector.sub(camera.position).normalize();

	// 创建射线投射器对象
	let rayCaster = new THREE.Raycaster(camera.position, ray);

	// 返回射线选中的对象数组(第二个参数默认值是false，意为是否遍历图形内部的所有子图形)
	let intersects = rayCaster.intersectObjects(scene.children, true);
	if (intersects.length > 0) {
		// 射线拾取的首个对象
		let currObj = intersects[0];
		console.log(currObj.object.name);

		// console.log(currObj.object.parent.parent.name);
		// console.log(currObj.object.parent.parent.position);

		// var toposition = currObj.object.parent.parent.position.clone();
		// toposition.x += 0;
		// toposition.y += 2;
		// toposition.z += -6;

		// // animateCamera(toposition, currObj.object.parent.parent.position, 2000);
		// //在这里写点击标签触发事件
		// switch (currObj.object.name) {
		// 	case "shui":
		// 		console.log(0);
		// 		break;
		// 	case "tu":
		// 		console.log(1);
		// 		break;
		// 	case "jin":
		// 		console.log(2);
		// 		break;
		// 	default:
		// 		break;
		// }
	}
}

//相机移动
function animateCamera(position, target, speed) {
	console.log("position" + position.x);
	let tween = new TWEEN.Tween({
		px: camera.position.x, // 起始相机位置x
		py: camera.position.y, // 起始相机位置y
		pz: camera.position.z, // 起始相机位置z
		tx: controls.target.x, // 控制点的中心点x 起始目标位置x
		ty: controls.target.y, // 控制点的中心点y 起始目标位置y
		tz: controls.target.z // 控制点的中心点z 起始目标位置z
	})
	tween.to({
		px: position.x,
		py: position.y,
		pz: position.z,
		tx: target.x,
		ty: target.y,
		tz: target.z
	}, speed)
	tween.onUpdate(function (param) {
		camera.position.x = param.px
		camera.position.y = param.py
		camera.position.z = param.pz
		controls.target.x = param.tx
		controls.target.y = param.ty
		controls.target.z = param.tz
		camera.lookAt(controls.target);
		controls.update();
	})

	// tween.easing(TWEEN.Easing.Cubic.InOut);
	tween.start();
}