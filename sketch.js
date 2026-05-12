// Face Mesh Detection with ml5.js  
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/facemesh  
// https://youtu.be/R5UZsIwPbJA  

let video;
let faceMesh;
let handPose;
let faces = [];
let hands = [];
let earringImgs = [];
let currentEarring;

function preload() {
  // Initialize FaceMesh model with a maximum of one face and flipped video input
  faceMesh = ml5.faceMesh({ maxFaces: 1, flipped: true });
  // Initialize HandPose model
  handPose = ml5.handPose({ flipped: true });
  
  // 載入 5 款耳環圖片
  earringImgs[0] = loadImage('earrings/acc1_ring.png');
  earringImgs[1] = loadImage('earrings/acc2_pearl.png');
  earringImgs[2] = loadImage('earrings/acc3_tassel.png');
  earringImgs[3] = loadImage('earrings/acc4_jade.png');
  earringImgs[4] = loadImage('earrings/acc5_phoenix.png');
  
  currentEarring = earringImgs[0]; // 預設顯示第一款
}

function mousePressed() {
  // Log detected face data tothe console
  console.log(faces);
}

function gotFaces(results) {
  faces = results;
}

function gotHands(results) {
  hands = results;
}

function setup() {
  // 產生一個全螢幕的畫布
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Start detecting faces
  if (faceMesh) {
    faceMesh.detectStart(video, gotFaces);
  }
  if (handPose) {
    handPose.detectStart(video, gotHands);
  }
}

function draw() {
  // 畫布的背景顏色為 e7c6ff
  background('#e7c6ff');

  // 計算影像顯示的大小 (全螢幕寬高的 50%)
  let displayW = width * 0.5;
  let displayH = height * 0.5;

  // 計算置中位置
  let x = (width - displayW) / 2;
  let y = (height - displayH) / 2;

  // 顯示文字
  fill(0); // 設定文字顏色為黑色
  textSize(windowHeight * 0.05); // 根據視窗高度動態調整字體大小
  textAlign(CENTER, BOTTOM); // 水平置中，基準點在文字底部
  text("414730035張O芸", width / 2, y - 10); // 顯示在畫布中間，影像上方 10 像素的位置

  // 顯示擷取的攝影機影像 (由於 createCapture 已設定 flipped: true，影像會是左右顛倒的鏡像)
  image(video, x, y, displayW, displayH);

  // 手勢辨識切換耳環
  if (hands.length > 0) {
    let hand = hands[0];
    let count = 0;
    
    // 判斷食指、中指、無名指、小指是否伸直 (Tip 的 Y 座標小於 PIP 關節的 Y 座標)
    if (hand.keypoints[8].y < hand.keypoints[6].y) count++;  // 食指
    if (hand.keypoints[12].y < hand.keypoints[10].y) count++; // 中指
    if (hand.keypoints[16].y < hand.keypoints[14].y) count++; // 無名指
    if (hand.keypoints[20].y < hand.keypoints[18].y) count++; // 小指
    // 大拇指判斷 (判斷 Tip 與小指根部的距離是否大於關節與小指根部的距離)
    let d1 = dist(hand.keypoints[4].x, hand.keypoints[4].y, hand.keypoints[17].x, hand.keypoints[17].y);
    let d2 = dist(hand.keypoints[3].x, hand.keypoints[3].y, hand.keypoints[17].x, hand.keypoints[17].y);
    if (d1 > d2) count++;

    if (count >= 1 && count <= 5) {
      currentEarring = earringImgs[count - 1];
    }
  }

  // Ensure at least one face is detected
  if (faces.length > 0) {
    let face = faces[0];

    // 定義左右耳垂的索引值 (MediaPipe Face Mesh 索引：177 為右耳垂, 401 為左耳垂)
    let earlobeIndices = [177, 401];

    earlobeIndices.forEach(index => {
      let keypoint = face.keypoints[index];
      if (keypoint) {
        let mx = map(keypoint.x, 0, video.width, x, x + displayW);
        let my = map(keypoint.y, 0, video.height, y, y + displayH);

        // 設定耳環顯示的大小 (依據影像寬度調整比例)
        let earringW = displayW * 0.06; 
        let earringH = earringW * (currentEarring.height / currentEarring.width);

        // 繪製耳環圖片，將圖片頂端中心點對準耳垂座標 (mx, my)
        image(currentEarring, mx - earringW / 2, my, earringW, earringH);
      }
    });
  }
}