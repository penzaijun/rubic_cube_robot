var renderer;//渲染器
var width;//页面宽度
var height;//页面高度
var raycaster = new THREE.Raycaster();//光线碰撞检测器
var mouse = new THREE.Vector2();//存储鼠标坐标或者触摸坐标
var isRotating = false;//魔方是否正在转动
var intersect;//碰撞光线穿过的元素
var normalize;//触发平面法向量
var startPoint;//触发点
var movePoint;
var minCubeIndex;
var initStatus = [];//魔方初始状态
var startFaceNo = 0;
var currentFaceNo = 0;
var endFaceNo = 3;
var totalTime = 200;


//魔方转动的六个方向
const XLine = new THREE.Vector3( 1, 0, 0 );//X轴正方向
const XLineAd = new THREE.Vector3( -1, 0, 0 );//X轴负方向
const YLine = new THREE.Vector3( 0, 1, 0 );//Y轴正方向
const YLineAd = new THREE.Vector3( 0, -1, 0 );//Y轴负方向
const ZLine = new THREE.Vector3( 0, 0, 1 );//Z轴正方向
const ZLineAd = new THREE.Vector3( 0, 0, -1 );//Z轴负方向
const CubeParams = {//魔方参数
	x:0,
	y:0,
	z:0,
	num:3,
	len:50,
	//[右,左,上,下,前,后]
	colors:['red','orange','yellow','white','blue','green'],
	sequences:['R','L','U','D','F','B']//默认序列名
};

//随机旋转，用于打乱魔方
function autoResetV2(funcArr){
	totalTime = 200;
	//if(!isRotating&&!isAutoReset){
		//var stepNum = parseInt(20*Math.random())+1;//保证至少转动一步
		//var stepNum = 0;
		//console.log('random rotate '+stepNum);
		//var funcArr = [D, D, r, d, F, F, B, D, R, R, D, D, r, F, F, d, F, F, u, B, B, L, L, U, U, D, R, R, U];
		var stepArr = [];
		for(var i=0;i<funcArr.length;i++){
			//var num = parseInt(Math.random()*funcArr.length);
			stepArr.push(funcArr[i]);
		}
		runMethodAtNo(stepArr,0,0);
	//}
}

//自动还原第一版
var isAutoReset = false;
var currentStep = 1;
var bottomColor;
var topColor;
var startTime = 0;
var endTime = 0;
var stepCount = 0;

//二阶段还原
function randomRotate( funcArr ){
	totalTime = 10;
	if(!isRotating&&!isAutoReset){
		//var stepNum = parseInt(20*Math.random())+1;//保证至少转动一步
		//var stepNum = 0;
		//console.log('random rotate '+stepNum);
		//var funcArr = [u, r, r, d, u, u, l, l, b, b, U, f, f, D, f, f, R, d, d, r, r, d, b, f, f, D, R, d, d];	            	
		var stepArr = [];
		for(var i=0;i<funcArr.length;i++){
			//var num = parseInt(Math.random()*funcArr.length);
			stepArr.push(funcArr[i]);
		}
		runMethodAtNo(stepArr,0,0);
	}
}

//获取魔方序列

function getRubikSequence(){
	var seq = [];

	//U
	var us = [18,19,20,9,10,11,0,1,2];
	for(var i=0;i<us.length;i++){
		var ui = getCubeByIndex(us[i]);
		seq.push(getFaceColorByVector(ui,YLine));
	}

	//R
	var rs = [2,11,20,5,14,23,8,17,26];
	for(var i=0;i<rs.length;i++){
		var ri = getCubeByIndex(rs[i]);
		seq.push(getFaceColorByVector(ri,XLine));
	}

	//F
	var fs = [0,1,2,3,4,5,6,7,8];
	for(var i=0;i<fs.length;i++){
		var fi = getCubeByIndex(fs[i]);
		seq.push(getFaceColorByVector(fi,ZLine));
	}

	//D
	var ds = [6,7,8,15,16,17,24,25,26];
	for(var i=0;i<ds.length;i++){
		var di = getCubeByIndex(ds[i]);
		seq.push(getFaceColorByVector(di,YLineAd));
	}

	//L
	var ls = [18,9,0,21,12,3,24,15,6];
	for(var i=0;i<ls.length;i++){
		var li = getCubeByIndex(ls[i]);
		seq.push(getFaceColorByVector(li,XLineAd));
	}

	//B
	var bs = [20,19,18,23,22,21,26,25,24];
	for(var i=0;i<bs.length;i++){
		var bi = getCubeByIndex(bs[i]);
		seq.push(getFaceColorByVector(bi,ZLineAd));
	}

	//因为并没有限制用户操作不能转动中心，因此默认魔方序列名可能会有变化，这里需要重新设置
	var cube10 = getCubeByIndex(10);
	var uColorIndex = getFaceColorByVector(cube10,YLine);
	CubeParams.sequences[uColorIndex] = 'U';

	var cube4 = getCubeByIndex(4);
	var fColorIndex = getFaceColorByVector(cube4,ZLine);
	CubeParams.sequences[fColorIndex] = 'F';

	var cube14 = getCubeByIndex(14);
	var rColorIndex = getFaceColorByVector(cube14,XLine);
	CubeParams.sequences[rColorIndex] = 'R';

	var cube12 = getCubeByIndex(12);
	var lColorIndex = getFaceColorByVector(cube12,XLineAd);
	CubeParams.sequences[lColorIndex] = 'L';

	var cube16 = getCubeByIndex(16);
	var dColorIndex = getFaceColorByVector(cube16,YLineAd);
	CubeParams.sequences[dColorIndex] = 'D';

	var cube22 = getCubeByIndex(22);
	var bColorIndex = getFaceColorByVector(cube22,ZLineAd);
	CubeParams.sequences[bColorIndex] = 'B';

	//颜色序号转换为魔方序列
	var str = '';
	for(var i=0;i<seq.length;i++){
		str += CubeParams.sequences[seq[i]];
	}

	return str;
	
	//UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB
	/**
	 |************|
	 |*U1**U2**U3*|
	 |************|
	 |*U4**U5**U6*|
	 |************|
	 |*U7**U8**U9*|
	 |************|
************|************|************|************
*L1**L2**L3*|*F1**F2**F3*|*R1**R2**R3*|*B1**B2**B3*
************|************|************|************
*L4**L5**L6*|*F4**F5**F6*|*R4**R5**R6*|*B4**B5**B6*
************|************|************|************
*L7**L8**L9*|*F7**F8**F9*|*R7**R8**R9*|*B7**B8**B9*
************|************|************|************
	 |************|
	 |*D1**D2**D3*|
	 |************|
	 |*D4**D5**D6*|
	 |************|
	 |*D7**D8**D9*|
	 |************|
	 */
}

//按顺序执行数组里边的方法
function runMethodAtNo(arr,no,rotateNum,next){
	if(no>=arr.length-1){
		if(next){
			arr[no](rotateNum,next);
		}else{
			arr[no](rotateNum);
		}
	}else{
		arr[no](rotateNum,function(){
			if(no<arr.length-1){
				no++
				runMethodAtNo(arr,no,rotateNum,next);
			}
		})
	}
}
/**
 * 魔方基本公式 U、F、L、D、R、u、f、l、d
 */
function U(rotateNum,next){
	stepCount++;
	var cube2 = getCubeByIndex(2,rotateNum);
	var zLine = rotateAxisByYLine(ZLine,rotateNum);
	var xLineAd = rotateAxisByYLine(XLineAd,rotateNum);
	normalize = zLine;
	rotateMove(cube2,xLineAd,next);
}
function u(rotateNum,next){
	stepCount++;
	var cube2 = getCubeByIndex(2,rotateNum);
	var xLine = rotateAxisByYLine(XLine,rotateNum);
	var zLineAd = rotateAxisByYLine(ZLineAd,rotateNum);
	normalize = xLine;
	rotateMove(cube2,zLineAd,next);
}
function F(rotateNum,next){
	stepCount++;
	var cube2 = getCubeByIndex(2,rotateNum);
	var xLine = rotateAxisByYLine(XLine,rotateNum);
	normalize = xLine;
	rotateMove(cube2,YLineAd,next);
}
function f(rotateNum,next){
	stepCount++;
	var cube2 = getCubeByIndex(2,rotateNum);
	var xLineAd = rotateAxisByYLine(XLineAd,rotateNum);
	normalize = YLine;
	rotateMove(cube2,xLineAd,next)
}
function L(rotateNum,next){
	stepCount++;
	var cube0 = getCubeByIndex(0,rotateNum);
	var zLine = rotateAxisByYLine(ZLine,rotateNum);
	normalize = zLine;
	rotateMove(cube0,YLineAd,next);
}
function l(rotateNum,next){
	stepCount++;
	var cube0 = getCubeByIndex(0,rotateNum);
	var zLineAd = rotateAxisByYLine(ZLineAd,rotateNum);
	normalize = YLine;
	rotateMove(cube0,zLineAd,next);
}
function D(rotateNum,next){
	stepCount++;
	var cube8 = getCubeByIndex(8,rotateNum);
	var xLine = rotateAxisByYLine(XLine,rotateNum);
	var zLineAd = rotateAxisByYLine(ZLineAd,rotateNum);
	normalize = xLine;
	rotateMove(cube8,zLineAd,next);
}
function d(rotateNum,next){
	stepCount++;
	var cube8 = getCubeByIndex(8,rotateNum);
	var zLine = rotateAxisByYLine(ZLine,rotateNum);
	var xLineAd = rotateAxisByYLine(XLineAd,rotateNum);
	normalize = zLine;
	rotateMove(cube8,xLineAd,next);
}
function R(rotateNum,next){
	stepCount++;
	var cube2 = getCubeByIndex(2,rotateNum);
	var zLineAd = rotateAxisByYLine(ZLineAd,rotateNum);
	normalize = YLine;
	rotateMove(cube2,zLineAd,next);
}
function r(rotateNum,next){
	stepCount++;
	var cube2 = getCubeByIndex(2,rotateNum);
	var zLine = rotateAxisByYLine(ZLine,rotateNum);
	normalize = zLine;
	rotateMove(cube2,YLineAd,next);
}
function B(rotateNum,next){
	stepCount++;
	var cube20 = getCubeByIndex(20,rotateNum);
	var xLine = rotateAxisByYLine(XLine,rotateNum);
	normalize = xLine;
	rotateMove(cube20,YLine,next);
}
function b(rotateNum,next){
	stepCount++;
	var cube20 = getCubeByIndex(20,rotateNum);
	var xLine = rotateAxisByYLine(XLine,rotateNum);
	normalize = xLine;
	rotateMove(cube20,YLineAd,next);
}
//根据索引素组获取方块
function getCubeByIndexs(indexs){
	var arr = [];
	for(var i=0;i<indexs.length;i++){
		arr.push(getCubeByIndex(indexs[i]));
	}
	return arr;
}
/**
 * 根据索引获取方块
 * @param  index     索引
 * @param  rotateNum 旋转次数
 */
function getCubeByIndex(index,rotateNum){
	var tempIndex = index;
	var tempRotateNum = rotateNum;
	while(rotateNum>0){
		if(parseInt(index/9)==0){
			if(index%3==0){
				index += 2;
			}else if(index%3==1){
				index += 10;
			}else if(index%3==2){
				index += 18;
			}
		}else if(index%3==2){
			if(parseInt(index/9)==0){
				index += 18;
			}else if(parseInt(index/9)==1){
				index += 8;
			}else if(parseInt(index/9)==2){
				index -= 2;
			}
		}else if(parseInt(index/9)==2){
			if(index%3==2){
				index -= 2;
			}else if(index%3==1){
				index -= 10;
			}else if(index%3==0){
				index -= 18;
			}
		}else if(index%3==0){
			if(parseInt(index/9)==2){
				index -= 18;
			}else if(parseInt(index/9)==1){
				index -= 8;
			}else if(parseInt(index/9)==0){
				index += 2;
			}
		}
		rotateNum--;
	}
	var cube; 
	for(var i=0;i<cubes.length;i++){
		if(cubes[i].cubeIndex == index+minCubeIndex){
			cube = cubes[i];
		}
	}
	return cube;
}
//根据Y轴旋转向量
function rotateAxisByYLine(vector,rotateNum){
	while(rotateNum>0){
		if(vector.angleTo(XLine)==0){
			vector = ZLineAd.clone();
		}else if(vector.angleTo(ZLineAd)==0){
			vector = XLineAd.clone();
		}else if(vector.angleTo(XLineAd)==0){
			vector = ZLine.clone();
		}else if(vector.angleTo(ZLine)==0){
			vector = XLine.clone();
		}
		rotateNum--
	}
	return vector;
}
//根据颜色序号获取初始化时其对面颜色序号
function getOppositeColor(no){
	if(no%2==0||no==0){
		return no+1;
	}else{
		return no-1;
	}
}
//获取法向量和已知向量方向相同的面的颜色序号
function getFaceColorByVector(cube,vector){
	var materials = cube.material.materials;
	var faces = cube.geometry.faces;
	var normalMatrix = cube.normalMatrix;
	
	/**
	 * 转换视角时摄像机位置发生了变动，模型开始上表面的法向量是世界坐标系的Y轴，现在依然是世界坐标系的Y轴；
	 * 但是小方块面的法向量乘以其法向量矩阵得到的是视图坐标系中的向量；
	 * 世界坐标系转换成视图坐标系需要乘以视图矩阵的逆反矩阵。
	 */
	var viewMatrix = new THREE.Matrix4();
	viewMatrix.lookAt(camera.position,viewCenter,camera.up);
	viewMatrix.getInverse(viewMatrix);
	var tempVector = vector.clone();
	tempVector.applyMatrix4(viewMatrix);
	var angles = [];

	for(var i=0;i<faces.length;i++){
		var tempNormal = faces[i].normal.clone();
		tempNormal.applyMatrix3(normalMatrix);
		/**
		 * 按道理这里应该判断两向量夹角是否等于0，但是因为存在精度问题；
		 * 有可能得到的角度很接近0，但却不等于0，另外不确定到底保留几位小数合适；
		 * 因此使用判断最小值的方式。
		 */
		angles.push(tempNormal.angleTo(tempVector));
	}
	var minNo = min(angles).no;
	return faces[minNo].materialIndex;
	//document.body.appendChild(materials[faces[minNo].materialIndex].map.image);
	//$frame.style.display = 'none';
}

window.requestAnimFrame = (function() {//如果有变化则可能还需要requestAnimationFrame刷新
	return window.requestAnimationFrame ||
		   window.mozRequestAnimationFrame ||
		   window.webkitRequestAnimationFrame ||
		   window.msRequestAnimationFrame ||
		   window.webkitRequestAnimationFrame;
})();

//根据页面宽度和高度创建渲染器，并添加容器中
var $frame = document.getElementById('canvas-frame');
function initThree() {
	width = window.innerWidth;
	height = window.innerHeight;
	renderer = new THREE.WebGLRenderer({
		antialias : true
	});
	renderer.setSize(width, height);
	renderer.setClearColor(0xFFFFFF, 1.0);
	$frame.appendChild(renderer.domElement);
}

//创建相机，并设置正方向和中心点
var camera;
var controller;//视角控制器
var viewCenter = new THREE.Vector3( 0, 0, 0 );
function initCamera() {
	camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
	camera.position.set(0, 0, 600);
	camera.up.set(0, 1, 0);//正方向
	camera.lookAt(viewCenter);
}

//创建场景，后续元素需要加入到场景中才会显示出来
var scene;
function initScene() {
	scene = new THREE.Scene();
}

//创建光线
var light;
function initLight() {
	light = new THREE.AmbientLight(0xfefefe);
	scene.add(light);
}

/**
 * 简易魔方
 * x、y、z 魔方中心点坐标
 * num 魔方阶数
 * len 小方块宽高
 * colors 魔方六面体颜色
 */
function SimpleCube(x, y, z, num, len, colors) {
	//魔方左上角坐标
	var leftUpX = x - num / 2 * len;
	var leftUpY = y + num / 2 * len;
	var leftUpZ = z + num / 2 * len;

	//根据颜色生成材质
	var materialArr = [];
	for (var i = 0; i < colors.length; i++) {
		var texture = new THREE.Texture(faces(colors[i]));
		texture.needsUpdate = true;
		var material = new THREE.MeshLambertMaterial({ map: texture });
		materialArr.push(material);
	}

	var cubes = [];
	for (var i = 0; i < num; i++) {
		for (var j = 0; j < num * num; j++) {
			var cubegeo = new THREE.BoxGeometry(len, len, len);
			var cube = new THREE.Mesh(cubegeo, materialArr);

			//依次计算各个小方块中心点坐标
			cube.position.x = (leftUpX + len / 2) + (j % num) * len;
			cube.position.y = (leftUpY - len / 2) - parseInt(j / num) * len;
			cube.position.z = (leftUpZ - len / 2) - i * len;
			cubes.push(cube)
		}
	}
	return cubes;
}

//生成canvas素材
function faces(rgbaColor) {
	var canvas = document.createElement('canvas');
	canvas.width = 256;
	canvas.height = 256;
	var context = canvas.getContext('2d');
	if (context) {
		//画一个宽高都是256的黑色正方形
		canvas.setAttribute('color',rgbaColor);
		context.fillStyle = 'rgba(0,0,0,1)';
		context.fillRect(0, 0, 256, 256);
		//在内部用某颜色的16px宽的线再画一个宽高为224的圆角正方形并用改颜色填充
		context.rect(16, 16, 224, 224);
		context.lineJoin = 'round';
		context.lineWidth = 16;
		context.fillStyle = rgbaColor;
		context.strokeStyle = rgbaColor;
		context.stroke();
		context.fill();
	} else {
		alert('您的浏览器不支持Canvas无法预览.\n');
	}
	return canvas;
}

//创建展示场景所需的各种元素
var cubes
function initObject() {
	//生成魔方小正方体
	cubes = SimpleCube(CubeParams.x,CubeParams.y,CubeParams.z,CubeParams.num,CubeParams.len,CubeParams.colors);
	var ids = [];   
	for(var i=0;i<cubes.length;i++){
		var item = cubes[i];
		/**
		 * 由于筛选运动元素时是根据物体的id规律来的，但是滚动之后位置发生了变化；
		 * 再根据初始规律筛选会出问题，而且id是只读变量；
		 * 所以这里给每个物体设置一个额外变量cubeIndex，每次滚动之后更新根据初始状态更新该cubeIndex；
		 * 让该变量一直保持初始规律即可。
		 */
		initStatus.push({
			x:item.position.x,
			y:item.position.y,
			z:item.position.z,
			cubeIndex:item.id
		});
		item.cubeIndex = item.id;
		ids.push(item.id);
		scene.add(cubes[i]);//并依次加入到场景中
	}
	minCubeIndex = min(ids).value;

	//透明正方体
	var cubegeo = new THREE.BoxGeometry(150,150,150);
	var hex = 0x000000;
	for ( var i = 0; i < cubegeo.faces.length; i += 2 ) {
		cubegeo.faces[ i ].color.setHex( hex );
		cubegeo.faces[ i + 1 ].color.setHex( hex );
	}
	var cubemat = new THREE.MeshBasicMaterial({vertexColors: THREE.FaceColors,opacity: 0, transparent: true});
	var cube = new THREE.Mesh( cubegeo, cubemat );
	cube.cubeType = 'coverCube';
	scene.add( cube );
}

//渲染
function render(){
	renderer.clear();
	renderer.render(scene, camera);
	window.requestAnimFrame(render);
}

//开始
function threeStart() {
	initThree();
	initCamera();
	initScene();
	initLight();
	initObject();
	render();
	//监听鼠标事件
	//renderer.domElement.addEventListener('mousedown', startCube, false);
	//renderer.domElement.addEventListener('mousemove', moveCube, false );
	//renderer.domElement.addEventListener('mouseup', stopCube,false);
	//监听触摸事件
	//renderer.domElement.addEventListener('touchstart', startCube, false);
	//renderer.domElement.addEventListener('touchmove', moveCube, false);
	//renderer.domElement.addEventListener('touchend', stopCube, false);
	//视角控制
	controller = new THREE.OrbitControls(camera, renderer.domElement);
	controller.target = viewCenter;//设置控制点

	//$(window).on("keypress",function(event){
	//    var key = event.keyCode;
	//    console.alert(String.fromCharCode(key));
	//});

	//document.onkeypress=function(ev){
	//	var oEvent = ev;   //处理兼容
	//	//console.alert(String.fromCharCode(oEvent.keyCode)); 
	//	str = String.fromCharCode(oEvent.keyCode);
	//	if( str=='a'){
	//		autoResetV2();
	//	}
	//	else if (str == 'b'){
	//		randomRotate();
	//	}
	//};

	//自动还原一
	//var $autoResetV2 = document.querySelector('#autoResetV2');
	//$autoResetV2.addEventListener('click',function(){
	//	autoResetV2()
	//},false);

	//随机旋转
	//var $randomRotate = document.querySelector('#randomRotate');
	//$randomRotate.addEventListener('click',function(){
	//	randomRotate();
	//},false);
}

//魔方操作结束
function stopCube(){
	intersect = null;
	startPoint = null
}

//绕着世界坐标系的某个轴旋转
function rotateAroundWorldY(obj,rad){
	var x0 = obj.position.x;
	var z0 = obj.position.z;
	/**
	 * 因为物体本身的坐标系是随着物体的变化而变化的，
	 * 所以如果使用rotateZ、rotateY、rotateX等方法，
	 * 多次调用后就会出问题，先改为Quaternion实现。
	 */
	var q = new THREE.Quaternion(); 
	q.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), rad );
	obj.quaternion.premultiply( q );
	//obj.rotateY(rad);
	obj.position.x = Math.cos(rad)*x0+Math.sin(rad)*z0;
	obj.position.z = Math.cos(rad)*z0-Math.sin(rad)*x0;
}
function rotateAroundWorldZ(obj,rad){
	var x0 = obj.position.x;
	var y0 = obj.position.y;
	var q = new THREE.Quaternion(); 
	q.setFromAxisAngle( new THREE.Vector3( 0, 0, 1 ), rad );
	obj.quaternion.premultiply( q );
	//obj.rotateZ(rad);
	obj.position.x = Math.cos(rad)*x0-Math.sin(rad)*y0;
	obj.position.y = Math.cos(rad)*y0+Math.sin(rad)*x0;
}
function rotateAroundWorldX(obj,rad){
	var y0 = obj.position.y;
	var z0 = obj.position.z;
	var q = new THREE.Quaternion(); 
	q.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), rad );
	obj.quaternion.premultiply( q );
	//obj.rotateX(rad);
	obj.position.y = Math.cos(rad)*y0-Math.sin(rad)*z0;
	obj.position.z = Math.cos(rad)*z0+Math.sin(rad)*y0;
}

//滑动操作魔方
function moveCube(event){
	getIntersects(event);
	if(intersect){
		if(!isRotating&&startPoint){//魔方没有进行转动且满足进行转动的条件
			movePoint = intersect.point;
			if(!movePoint.equals(startPoint)){//和起始点不一样则意味着可以得到转动向量了
				var sub = movePoint.sub(startPoint);//计算转动向量
				rotateMove(intersect.object,sub);
			}
		}
	}
	event.preventDefault();
}

//某方块在某个方向转动
function rotateMove(target,vector,next){
	isRotating = true;//转动标识置为true
	var direction = getDirection(vector);//获得方向
	var elements = getBoxs(target,direction);
	window.requestAnimFrame(function(timestamp){
		rotateAnimation(elements,direction,timestamp,0,null,next);
	});
}

/**
 * 旋转动画
 */
function rotateAnimation(elements,direction,currentstamp,startstamp,laststamp,next){
	//var totalTime = 200;//转动的总运动时间
	var isLastRotate = false;//是否是某次转动最后一次动画
	if(startstamp===0){
		startstamp = currentstamp;
		laststamp = currentstamp;
	}
	if(currentstamp-startstamp>=totalTime){
		currentstamp = startstamp+totalTime;
		isLastRotate = true;
	}
	switch(direction){
		//绕z轴顺时针
		case 0.1:
		case 1.2:
		case 2.4:
		case 3.3:
			for(var i=0;i<elements.length;i++){
				rotateAroundWorldZ(elements[i],-90*Math.PI/180*(currentstamp-laststamp)/totalTime);
			}
			break;
		//绕z轴逆时针
		case 0.2:
		case 1.1:
		case 2.3:
		case 3.4:
			for(var i=0;i<elements.length;i++){
				rotateAroundWorldZ(elements[i],90*Math.PI/180*(currentstamp-laststamp)/totalTime);
			}
			break;
		//绕y轴顺时针
		case 0.4:
		case 1.3:
		case 4.3:
		case 5.4:
			for(var i=0;i<elements.length;i++){
				rotateAroundWorldY(elements[i],-90*Math.PI/180*(currentstamp-laststamp)/totalTime);
			}
			break;
		//绕y轴逆时针
		case 1.4:
		case 0.3:
		case 4.4:
		case 5.3:
			for(var i=0;i<elements.length;i++){
				rotateAroundWorldY(elements[i],90*Math.PI/180*(currentstamp-laststamp)/totalTime);
			}
			break;
		//绕x轴顺时针
		case 2.2:
		case 3.1:
		case 4.1:
		case 5.2:
			for(var i=0;i<elements.length;i++){
				rotateAroundWorldX(elements[i],90*Math.PI/180*(currentstamp-laststamp)/totalTime);
			}
			break;
		//绕x轴逆时针
		case 2.1:
		case 3.2:
		case 4.2:
		case 5.1:
			for(var i=0;i<elements.length;i++){
				rotateAroundWorldX(elements[i],-90*Math.PI/180*(currentstamp-laststamp)/totalTime);
			}
			break;
		default:
			break;
	}
	if(!isLastRotate){
		window.requestAnimFrame(function(timestamp){
			rotateAnimation(elements,direction,timestamp,startstamp,currentstamp,next);
		});
	}else{
		isRotating = false;
		startPoint = null;
		updateCubeIndex(elements);
		if(next){
			next();
		}else{
			if(isAutoReset){
				switch(currentStep){
					case 1:
						step1();
						break;
					case 2:
						step2();
						break;
					case 3:
						step3();
						break;
					case 4:
						step4();
						break;
					case 5:
						step5();
						break;
					case 6:
						step6();
						break;
					case 7:
						step7();
						break;
					case 8:
						step8();
						break;
					default:
						break;
				}
			}
		}
	}
}

//更新位置索引
function updateCubeIndex(elements){
	for(var i=0;i<elements.length;i++){
		var temp1 = elements[i];
		for(var j=0;j<initStatus.length;j++){
			var temp2 = initStatus[j];
			if( Math.abs(temp1.position.x - temp2.x)<=CubeParams.len/2 && 
				Math.abs(temp1.position.y - temp2.y)<=CubeParams.len/2 && 
				Math.abs(temp1.position.z - temp2.z)<=CubeParams.len/2 ){
				temp1.cubeIndex = temp2.cubeIndex;
				temp1.skipNext = false;
				break;
			}
		}
	}
}

//根据方向获得运动元素
function getBoxs(target,direction){
	var targetId = target.cubeIndex;
	targetId = targetId-minCubeIndex;
	var numI = parseInt(targetId/9);
	var numJ = targetId%9;
	var boxs = [];
	//根据绘制时的规律判断 no = i*9+j
	switch(direction){
		//绕z轴
		case 0.1:
		case 0.2:
		case 1.1:
		case 1.2:
		case 2.3:
		case 2.4:
		case 3.3:
		case 3.4:
			for(var i=0;i<cubes.length;i++){
				var tempId = cubes[i].cubeIndex-minCubeIndex;
				if(numI===parseInt(tempId/9)){
					boxs.push(cubes[i]);
				}
			}
			break;
		//绕y轴
		case 0.3:
		case 0.4:
		case 1.3:
		case 1.4:
		case 4.3:
		case 4.4:
		case 5.3:
		case 5.4:
			for(var i=0;i<cubes.length;i++){
				var tempId = cubes[i].cubeIndex-minCubeIndex;
				if(parseInt(numJ/3)===parseInt(tempId%9/3)){
					boxs.push(cubes[i]);
				}
			}
			break;
		//绕x轴
		case 2.1:
		case 2.2:
		case 3.1:
		case 3.2:
		case 4.1:
		case 4.2:
		case 5.1:
		case 5.2:
			for(var i=0;i<cubes.length;i++){
				var tempId = cubes[i].cubeIndex-minCubeIndex;
				if(tempId%9%3===numJ%3){
					boxs.push(cubes[i]);
				}
			}
			break;
		default:
			break;
	}
	return boxs;
}

//获得旋转方向
function getDirection(vector3){
	var direction;
	//判断差向量和x、y、z轴的夹角
	var xAngle = vector3.angleTo(XLine);
	var xAngleAd = vector3.angleTo(XLineAd);
	var yAngle = vector3.angleTo(YLine);
	var yAngleAd = vector3.angleTo(YLineAd);
	var zAngle = vector3.angleTo(ZLine);
	var zAngleAd = vector3.angleTo(ZLineAd);
	var minAngle = min([xAngle,xAngleAd,yAngle,yAngleAd,zAngle,zAngleAd]).value;//最小夹角

	switch(minAngle){
		case xAngle:
			direction = 0;//向x轴正方向旋转90度（还要区分是绕z轴还是绕y轴）
			if(normalize.equals(YLine)){
				direction = direction+0.1;//绕z轴顺时针
			}else if(normalize.equals(YLineAd)){
				direction = direction+0.2;//绕z轴逆时针
			}else if(normalize.equals(ZLine)){
				direction = direction+0.3;//绕y轴逆时针
			}else{
				direction = direction+0.4;//绕y轴顺时针
			}
			break;
		case xAngleAd:
			direction = 1;//向x轴反方向旋转90度
			if(normalize.equals(YLine)){
				direction = direction+0.1;//绕z轴逆时针
			}else if(normalize.equals(YLineAd)){
				direction = direction+0.2;//绕z轴顺时针
			}else if(normalize.equals(ZLine)){
				direction = direction+0.3;//绕y轴顺时针
			}else{
				direction = direction+0.4;//绕y轴逆时针
			}
			break;
		case yAngle:
			direction = 2;//向y轴正方向旋转90度
			if(normalize.equals(ZLine)){
				direction = direction+0.1;//绕x轴逆时针
			}else if(normalize.equals(ZLineAd)){
				direction = direction+0.2;//绕x轴顺时针
			}else if(normalize.equals(XLine)){
				direction = direction+0.3;//绕z轴逆时针
			}else{
				direction = direction+0.4;//绕z轴顺时针
			}
			break;
		case yAngleAd:
			direction = 3;//向y轴反方向旋转90度
			if(normalize.equals(ZLine)){
				direction = direction+0.1;//绕x轴顺时针
			}else if(normalize.equals(ZLineAd)){
				direction = direction+0.2;//绕x轴逆时针
			}else if(normalize.equals(XLine)){
				direction = direction+0.3;//绕z轴顺时针
			}else{
				direction = direction+0.4;//绕z轴逆时针
			}
			break;
		case zAngle:
			direction = 4;//向z轴正方向旋转90度
			if(normalize.equals(YLine)){
				direction = direction+0.1;//绕x轴顺时针
			}else if(normalize.equals(YLineAd)){
				direction = direction+0.2;//绕x轴逆时针
			}else if(normalize.equals(XLine)){
				direction = direction+0.3;//绕y轴顺时针
			}else{
				direction = direction+0.4;//绕y轴逆时针
			}
			break;
		case zAngleAd:
			direction = 5;//向z轴反方向旋转90度
			if(normalize.equals(YLine)){
				direction = direction+0.1;//绕x轴逆时针
			}else if(normalize.equals(YLineAd)){
				direction = direction+0.2;//绕x轴顺时针
			}else if(normalize.equals(XLine)){
				direction = direction+0.3;//绕y轴逆时针
			}else{
				direction = direction+0.4;//绕y轴顺时针
			}
			break;
		default:
			break;
	}
	return direction;
}

//获取数组中的最小值
function min(arr){
	var min = arr[0];
	var no = 0;
	for(var i=1;i<arr.length;i++){
		if(arr[i]<min){
			min = arr[i];
			no = i;
		}
	}
	return {no:no,value:min};
}

//是否存在重复值
function isRepeat(arr){
	arr.sort(function(a,b){
		if(a<b){
			return -1;
		}
		if(a>b){
			return 1;
		}
		return 0;
	});
	for(var i=0;i<arr.length-1;i++){
		if(arr[i]==arr[i+1]){
			return true;
		}
	}
	return false;
}

//开始操作魔方
function startCube(event){
	getIntersects(event);
	//魔方没有处于转动过程中且存在碰撞物体
	if(!isRotating&&intersect){
		startPoint = intersect.point;//开始转动，设置起始点
		controller.enabled = false;//当刚开始的接触点在魔方上时操作为转动魔方，屏蔽控制器转动
	}else{
		controller.enabled = true;//当刚开始的接触点没有在魔方上或者在魔方上但是魔方正在转动时操作转动控制器
	}
}

//获取操作焦点以及该焦点所在平面的法向量
function getIntersects(event){
	//触摸事件和鼠标事件获得坐标的方式有点区别
	if(event.touches){
		var touch = event.touches[0];
		mouse.x = (touch.clientX / width)*2 - 1;
		mouse.y = -(touch.clientY / height)*2 + 1;
	}else{
		mouse.x = (event.clientX / width)*2 - 1;
		mouse.y = -(event.clientY / height)*2 + 1;
	}
	raycaster.setFromCamera(mouse, camera);
	//Raycaster方式定位选取元素，可能会选取多个，以第一个为准
	var intersects = raycaster.intersectObjects(scene.children);
	if(intersects.length){
		try{
			if(intersects[0].object.cubeType==='coverCube'){
				intersect = intersects[1];
				normalize = intersects[0].face.normal;
			}else{
				intersect = intersects[0];
				normalize = intersects[1].face.normal;
			}
		}catch(err){
			//nothing
		}
	}
}