let gameState = 'menu'; // 'menu', 'playing', 'success', 'failed'
let centerPathPoints = []; // 中心路徑點
let topBoundaryPoints = []; // 上邊界點
let bottomBoundaryPoints = []; // 下邊界點
let canvasWidth = 1200;
let canvasHeight = 700;
let successMessage = '';

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  initializeGame();
}

function initializeGame() {
  centerPathPoints = [];
  topBoundaryPoints = [];
  bottomBoundaryPoints = [];
  
  // 生成中心路徑點 - 蜿蜒的道路
  const numSegments = 12; // 路徑段數
  for (let i = 0; i <= numSegments; i++) {
    let x = (i / numSegments) * (canvasWidth - 100) + 50;
    
    // 創建蛇形運動
    let waveAmount = sin(i * 0.8) * 100;
    let y = canvasHeight / 2 + waveAmount;
    
    // 偶爾加入額外的彎曲變化
    if (i % 3 === 0 && i > 0 && i < numSegments) {
      y += cos(i * 1.2) * 80;
    }
    
    centerPathPoints.push({x: x, y: y});
  }
  
  // 根據中心路徑生成上下邊界 - 道路越往後越窄
  for (let i = 0; i < centerPathPoints.length; i++) {
    let current = centerPathPoints[i];
    let next = centerPathPoints[i + 1] || centerPathPoints[i];
    
    // 計算方向向量（垂直於路徑）
    let dx = next.x - current.x;
    let dy = next.y - current.y;
    let distance = sqrt(dx * dx + dy * dy);
    
    // 正規化
    if (distance > 0) {
      dx /= distance;
      dy /= distance;
    }
    
    // 計算垂直方向（旋轉90度）
    let perpX = -dy;
    let perpY = dx;
    
    // 動態計算道路寬度 - 越往後越窄
    // 起點寬度80像素，終點寬度30像素
    let progress = i / (centerPathPoints.length - 1); // 0到1的進度
    let currentWidth = 80 - (progress * 50); // 從80縮小到30
    
    let offset = currentWidth / 2;
    topBoundaryPoints.push({
      x: current.x + perpX * offset,
      y: current.y + perpY * offset
    });
    bottomBoundaryPoints.push({
      x: current.x - perpX * offset,
      y: current.y - perpY * offset
    });
  }
}

function draw() {
  background(100, 120, 150);
  
  // 繪製不可通行區域（紅色）
  fill(200, 100, 100);
  noStroke();
  rect(0, 0, canvasWidth, canvasHeight);
  
  // 繪製可通行區域（綠色路徑）
  drawPath();
  
  if (gameState === 'menu') {
    drawMenu();
  } else if (gameState === 'playing') {
    updateGame();
    drawPlayer();
  } else if (gameState === 'success') {
    drawSuccess();
  } else if (gameState === 'failed') {
    drawFailed();
  }
}

function drawPath() {
  // 繪製可通行區域（中間的綠色區域）
  fill(100, 200, 100);
  noStroke();
  beginShape();
  
  // 繪製上邊界
  for (let i = 0; i < topBoundaryPoints.length; i++) {
    vertex(topBoundaryPoints[i].x, topBoundaryPoints[i].y);
  }
  
  // 繪製下邊界（反向）
  for (let i = bottomBoundaryPoints.length - 1; i >= 0; i--) {
    vertex(bottomBoundaryPoints[i].x, bottomBoundaryPoints[i].y);
  }
  
  endShape(CLOSE);
  
  // 繪製中心路徑線（作為參考）
  stroke(255, 255, 100);
  strokeWeight(1);
  noFill();
  beginShape();
  for (let i = 0; i < centerPathPoints.length; i++) {
    vertex(centerPathPoints[i].x, centerPathPoints[i].y);
  }
  endShape();
  
  // 繪製起點和終點標記
  noStroke();
  fill(0, 255, 0);
  circle(centerPathPoints[0].x, centerPathPoints[0].y, 20);
  
  fill(255, 0, 0);
  circle(centerPathPoints[centerPathPoints.length - 1].x, centerPathPoints[centerPathPoints.length - 1].y, 20);
  
  // 添加馬路裝飾
  drawRoadDecorations();
}

function drawRoadDecorations() {
  // 繪製道路標線
  stroke(255, 255, 255);
  strokeWeight(3);
  for (let i = 0; i < centerPathPoints.length - 1; i++) {
    let current = centerPathPoints[i];
    let next = centerPathPoints[i + 1];
    
    // 繪製虛線
    let distance = dist(current.x, current.y, next.x, next.y);
    let numDashes = floor(distance / 20);
    
    for (let j = 0; j < numDashes; j++) {
      let t = j / numDashes;
      let x1 = lerp(current.x, next.x, t);
      let y1 = lerp(current.y, next.y, t);
      let x2 = lerp(current.x, next.x, t + 0.05);
      let y2 = lerp(current.y, next.y, t + 0.05);
      
      if (j % 2 === 0) {
        line(x1, y1, x2, y2);
      }
    }
  }
  
  // 繪製路燈
  noStroke();
  fill(200, 200, 200);
  for (let i = 0; i < centerPathPoints.length; i += 2) {
    let point = centerPathPoints[i];
    
    // 路燈柱子
    fill(150, 150, 150);
    rect(point.x - 3, point.y - 80, 6, 80);
    
    // 路燈燈罩
    fill(255, 255, 200);
    ellipse(point.x, point.y - 80, 20, 15);
    
    // 燈光效果
    fill(255, 255, 200, 50);
    ellipse(point.x, point.y - 80, 40, 30);
  }
  
  // 繪製交通標誌
  drawTrafficSigns();
  
  // 繪製樹木
  drawTrees();
  
  // 繪製建築物
  drawBuildings();
}

function drawTrafficSigns() {
  // 速度限制標誌
  let signX = 100;
  let signY = 100;
  
  // 標誌底座
  fill(100, 100, 100);
  rect(signX - 5, signY + 40, 10, 20);
  
  // 標誌圓形
  fill(255, 255, 255);
  stroke(255, 0, 0);
  strokeWeight(4);
  circle(signX, signY, 50);
  
  // 速度數字
  fill(255, 0, 0);
  noStroke();
  textSize(20);
  textAlign(CENTER, CENTER);
  text('50', signX, signY);
  
  // 警告標誌
  let warningX = canvasWidth - 100;
  let warningY = 120;
  
  fill(255, 255, 0);
  stroke(0);
  strokeWeight(2);
  
  // 三角形警告標誌
  beginShape();
  vertex(warningX, warningY - 25);
  vertex(warningX - 20, warningY + 15);
  vertex(warningX + 20, warningY + 15);
  endShape(CLOSE);
  
  // 驚嘆號
  fill(0);
  textSize(16);
  text('!', warningX, warningY + 2);
}

function drawTrees() {
  // 在道路兩側繪製樹木
  for (let i = 0; i < 8; i++) {
    let treeX = 50 + (i * 150);
    let treeY = canvasHeight - 100;
    
    // 樹幹
    fill(139, 69, 19);
    noStroke();
    rect(treeX - 5, treeY - 40, 10, 40);
    
    // 樹葉
    fill(34, 139, 34);
    ellipse(treeX, treeY - 50, 30, 40);
    ellipse(treeX - 10, treeY - 45, 25, 35);
    ellipse(treeX + 10, treeY - 45, 25, 35);
  }
}

function drawBuildings() {
  // 背景建築物
  fill(150, 150, 200);
  stroke(100, 100, 150);
  strokeWeight(1);
  
  // 建築物1
  rect(200, 50, 80, 150);
  // 窗戶
  fill(255, 255, 150);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 5; j++) {
      rect(210 + i * 20, 70 + j * 25, 15, 15);
    }
  }
  
  // 建築物2
  fill(180, 180, 220);
  rect(350, 30, 100, 180);
  // 窗戶
  fill(255, 255, 150);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 6; j++) {
      rect(365 + i * 20, 50 + j * 25, 15, 15);
    }
  }
  
  // 建築物3
  fill(160, 160, 210);
  rect(550, 70, 90, 130);
  // 窗戶
  fill(255, 255, 150);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 4; j++) {
      rect(565 + i * 20, 90 + j * 25, 15, 15);
    }
  }
}

function drawPlayer() {
  // 繪製鼠標游標位置
  fill(255, 255, 0);
  stroke(0);
  strokeWeight(2);
  circle(mouseX, mouseY, 15);
}

function updateGame() {
  // 檢查鼠標是否在可通行區域內
  if (!isPointInPath(mouseX, mouseY)) {
    gameState = 'failed';
    successMessage = '發生嚴重車禍！請小心駕駛';
    return;
  }
  
  // 檢查是否到達終點（終點紅色圓圈）
  let endPoint = centerPathPoints[centerPathPoints.length - 1];
  let distanceToEnd = dist(mouseX, mouseY, endPoint.x, endPoint.y);
  
  if (distanceToEnd < 30) {
    gameState = 'success';
    successMessage = '恭喜通過！';
  }
}

function isPointInPath(px, py) {
  // 使用射線投射算法檢測點是否在多邊形內
  let inside = false;
  
  // 構建完整的多邊形頂點
  let vertices = [];
  for (let i = 0; i < topBoundaryPoints.length; i++) {
    vertices.push(topBoundaryPoints[i]);
  }
  for (let i = bottomBoundaryPoints.length - 1; i >= 0; i--) {
    vertices.push(bottomBoundaryPoints[i]);
  }
  
  let j = vertices.length - 1;
  for (let i = 0; i < vertices.length; i++) {
    let xi = vertices[i].x, yi = vertices[i].y;
    let xj = vertices[j].x, yj = vertices[j].y;
    
    let intersect = ((yi > py) !== (yj > py)) &&
                    (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
    j = i;
  }
  
  return inside;
}

function drawMenu() {
  // 半透明背景
  fill(0, 0, 0, 200);
  rect(0, 0, canvasWidth, canvasHeight);
  
  fill(255);
  textSize(48);
  textAlign(CENTER, CENTER);
  text('🚗 電流急急棒 - 車禍版 🚗', canvasWidth / 2, 80);
  
  textSize(24);
  fill(200, 200, 100);
  text('遊戲規則：', canvasWidth / 2, 150);
  
  textSize(18);
  fill(255);
  textAlign(CENTER);
  let ruleY = 200;
  text('・將滑鼠游標從綠色起點移動到紅色終點', canvasWidth / 2, ruleY);
  text('・不能碰到紅色牆壁，碰到即發生車禍！', canvasWidth / 2, ruleY + 40);
  text('・路線會有蛇形彎曲，需要小心操控', canvasWidth / 2, ruleY + 80);
  text('・⚠️ 道路會越往後越窄，難度逐漸增加！', canvasWidth / 2, ruleY + 120);
  text('・順利抵達終點即成功', canvasWidth / 2, ruleY + 160);
  
  textSize(28);
  fill(100, 255, 100);
  text('點擊滑鼠開始遊戲', canvasWidth / 2, canvasHeight - 100);
}

function drawSuccess() {
  fill(0, 0, 0, 220);
  rect(0, 0, canvasWidth, canvasHeight);
  
  textAlign(CENTER, CENTER);
  textSize(60);
  fill(100, 255, 100);
  text('🎉 安全到達！🎉', canvasWidth / 2, canvasHeight / 2 - 80);
  
  textSize(28);
  fill(255);
  text('你成功避開了所有危險！', canvasWidth / 2, canvasHeight / 2 + 20);
  
  textSize(24);
  fill(200, 200, 100);
  text('點擊重新開始', canvasWidth / 2, canvasHeight / 2 + 100);
}

function drawFailed() {
  // 繪製爆炸背景
  background(255, 100, 0);
  
  // 添加煙霧效果
  for (let i = 0; i < 20; i++) {
    let smokeX = random(canvasWidth);
    let smokeY = random(canvasHeight);
    fill(100, 100, 100, 100);
    noStroke();
    ellipse(smokeX, smokeY, random(50, 150));
  }
  
  // 繪製爆炸火球
  fill(255, 150, 0);
  noStroke();
  ellipse(canvasWidth / 2, canvasHeight / 2, 200, 200);
  
  fill(255, 200, 0);
  ellipse(canvasWidth / 2, canvasHeight / 2, 150, 150);
  
  fill(255, 255, 100);
  ellipse(canvasWidth / 2, canvasHeight / 2, 100, 100);
  
  // 繪製火花
  for (let i = 0; i < 50; i++) {
    let angle = random(TWO_PI);
    let distance = random(50, 200);
    let sparkX = canvasWidth / 2 + cos(angle) * distance;
    let sparkY = canvasHeight / 2 + sin(angle) * distance;
    
    stroke(255, 255, 0);
    strokeWeight(2);
    point(sparkX, sparkY);
    
    // 火花尾跡
    stroke(255, 150, 0, 150);
    strokeWeight(1);
    let trailX = canvasWidth / 2 + cos(angle) * (distance - 20);
    let trailY = canvasHeight / 2 + sin(angle) * (distance - 20);
    line(trailX, trailY, sparkX, sparkY);
  }
  
  // 繪製血跡
  drawBloodSplatter();
  
  // 繪製車輛殘骸
  drawCarWreckage();
  
  // 繪製失敗文字
  fill(255, 0, 0);
  textSize(80);
  textAlign(CENTER, CENTER);
  text('💥 車禍！💥', canvasWidth / 2, canvasHeight / 2 - 150);
  
  textSize(30);
  fill(255, 255, 255);
  text(successMessage, canvasWidth / 2, canvasHeight / 2 - 80);
  
  textSize(24);
  fill(255, 255, 0);
  text('點擊重新開始', canvasWidth / 2, canvasHeight / 2 + 200);
}

function drawBloodSplatter() {
  // 繪製血跡噴濺
  for (let i = 0; i < 30; i++) {
    let bloodX = random(canvasWidth);
    let bloodY = random(canvasHeight);
    let bloodSize = random(10, 50);
    
    fill(139, 0, 0, 200);
    noStroke();
    ellipse(bloodX, bloodY, bloodSize, bloodSize * 0.6);
    
    // 血滴
    fill(139, 0, 0);
    ellipse(bloodX + random(-20, 20), bloodY + random(-20, 20), bloodSize * 0.3, bloodSize * 0.2);
  }
  
  // 大血泊
  fill(139, 0, 0, 150);
  ellipse(canvasWidth / 2 + 100, canvasHeight / 2 + 100, 150, 80);
  ellipse(canvasWidth / 2 - 100, canvasHeight / 2 - 100, 120, 60);
}

function drawCarWreckage() {
  // 繪製車輛殘骸碎片
  fill(100, 100, 100);
  noStroke();
  
  // 車身碎片
  beginShape();
  vertex(canvasWidth / 2 - 50, canvasHeight / 2 - 30);
  vertex(canvasWidth / 2 - 20, canvasHeight / 2 - 50);
  vertex(canvasWidth / 2 + 30, canvasHeight / 2 - 20);
  vertex(canvasWidth / 2 + 50, canvasHeight / 2 + 10);
  vertex(canvasWidth / 2 + 20, canvasHeight / 2 + 30);
  vertex(canvasWidth / 2 - 30, canvasHeight / 2 + 20);
  endShape(CLOSE);
  
  // 輪胎碎片
  fill(50, 50, 50);
  ellipse(canvasWidth / 2 + 80, canvasHeight / 2 + 50, 40, 20);
  ellipse(canvasWidth / 2 - 80, canvasHeight / 2 - 50, 35, 18);
  
  // 金屬碎片
  fill(150, 150, 150);
  for (let i = 0; i < 15; i++) {
    let debrisX = canvasWidth / 2 + random(-150, 150);
    let debrisY = canvasHeight / 2 + random(-150, 150);
    let size = random(5, 20);
    rect(debrisX, debrisY, size, size * 0.5);
  }
  
  // 玻璃碎片
  fill(200, 200, 255, 150);
  for (let i = 0; i < 25; i++) {
    let glassX = canvasWidth / 2 + random(-200, 200);
    let glassY = canvasHeight / 2 + random(-200, 200);
    let size = random(3, 15);
    ellipse(glassX, glassY, size, size * 0.3);
  }
}

function mousePressed() {
  if (gameState === 'menu') {
    gameState = 'playing';
    initializeGame();
    return false;
  } else if (gameState === 'success' || gameState === 'failed') {
    gameState = 'menu';
    return false;
  }
}
