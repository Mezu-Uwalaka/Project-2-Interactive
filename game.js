const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDiv = document.getElementById('score');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Game variables
let player = { x: 80, y: 300, w: 72, h: 72, vy: 0, jumping: false, angle: 0, spinning: false, jumps: 0 }; // doubled size
let obstacles = [];
let floatingBlocks = [];
let groundY = () => canvas.height - 100;
let gravity = 0.7;
let jumpPower = 16;
let speed = 8;
let score = 0;
let gameOver = false;
let neonColors = ['#ff69b4', '#ff1493', '#ffb6d5', '#ff4fa3', '#ff85c2', '#b8326a'];
let isFlipped = false;
let flipTimer = 0;

function drawNeonRect(x, y, w, h, color) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 24;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
}

function drawNeonTriangle(x, y, w, h, color) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
}
function drawNeonCircle(x, y, r, color) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(x + r, y + r, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
}
function drawNeonStar(x, y, r, color) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 24;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        let angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
        let sx = x + r + Math.cos(angle) * r;
        let sy = y + r + Math.sin(angle) * r;
        ctx.lineTo(sx, sy);
        angle += Math.PI / 5;
        sx = x + r + Math.cos(angle) * (r * 0.5);
        sy = y + r + Math.sin(angle) * (r * 0.5);
        ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
}
function drawNeonDiamond(x, y, w, h, color) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x, y + h / 2);
    ctx.lineTo(x + w / 2, y + h);
    ctx.lineTo(x + w, y + h / 2);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
}
function drawNeonOctagon(x, y, size, color) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 24;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
        let angle = (Math.PI * 2 / 8) * i - Math.PI / 8;
        let px = x + size / 2 + Math.cos(angle) * size / 2;
        let py = y + size / 2 + Math.sin(angle) * size / 2;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
}

function drawPlayer() {
    ctx.save();
    ctx.translate(player.x + player.w / 2, player.y + player.h / 2);
    ctx.rotate(player.angle);
    ctx.translate(-player.w / 2, -player.h / 2);
    drawNeonRect(0, 0, player.w, player.h, '#ff69b4');
    // Eyes
    ctx.beginPath();
    ctx.arc(20, 28, 6, 0, Math.PI * 2);
    ctx.arc(52, 28, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.8;
    ctx.fill();
    ctx.restore();
}

function drawObstacles() {
    for (let ob of obstacles) {
        if (ob.shape === 'rect') drawNeonRect(ob.x, ob.y, ob.w, ob.h, ob.color);
        else if (ob.shape === 'triangle') drawNeonTriangle(ob.x, ob.y, ob.w, ob.h, ob.color);
        else if (ob.shape === 'circle') drawNeonCircle(ob.x, ob.y, ob.w / 2, ob.color);
        else if (ob.shape === 'star') drawNeonStar(ob.x, ob.y, ob.w / 2, ob.color);
        else if (ob.shape === 'diamond') drawNeonDiamond(ob.x, ob.y, ob.w, ob.h, ob.color);
        else if (ob.shape === 'octagon') drawNeonOctagon(ob.x, ob.y, ob.w, ob.color);
    }
}

function drawFloatingBlocks() {
    for (let b of floatingBlocks) {
        drawNeonRect(b.x, b.y, b.w, b.h, b.color);
    }
}

function drawGround() {
    ctx.save();
    ctx.shadowColor = '#00fff7';
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#1a005a';
    ctx.fillRect(0, groundY() + 36, canvas.width, 40);
    ctx.restore();
    // Neon lines
    for (let i = 0; i < canvas.width; i += 80) {
        ctx.save();
        ctx.strokeStyle = neonColors[i % neonColors.length];
        ctx.shadowColor = neonColors[i % neonColors.length];
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(i, groundY() + 36);
        ctx.lineTo(i + 60, groundY() + 36);
        ctx.stroke();
        ctx.restore();
    }
}

function spawnObstacle() {
    let h = 36 + Math.floor(Math.random() * 40);
    let w = 24 + Math.floor(Math.random() * 32);
    let y = groundY() + 36 - h;
    let color = neonColors[Math.floor(Math.random() * neonColors.length)];
    let shapeRand = Math.random();
    let shape = shapeRand < 0.15 ? 'rect' : shapeRand < 0.3 ? 'triangle' : shapeRand < 0.5 ? 'circle' : shapeRand < 0.7 ? 'star' : shapeRand < 0.85 ? 'diamond' : 'octagon';
    obstacles.push({ x: canvas.width + 10, y, w, h, color, shape });
}

function spawnFloatingBlock() {
    let w = 80 + Math.random() * 60;
    let h = 24;
    // Lower and more accessible at the start
    let y = groundY() - 80 - Math.random() * 80;
    let color = neonColors[Math.floor(Math.random() * neonColors.length)];
    floatingBlocks.push({ x: canvas.width + 10, y, w, h, color });
}

function update() {
    if (gameOver) return;
    // Player physics
    player.vy += gravity;
    player.y += player.vy;
    // Spin if in air
    if (player.jumps > 0) {
        player.angle += 0.25;
        player.spinning = true;
    } else if (player.spinning) {
        // Snap to 0 when landing
        player.angle = 0;
        player.spinning = false;
    }
    // Ground collision
    let landed = false;
    if (player.y + player.h > groundY() + 36) {
        player.y = groundY() + 36 - player.h;
        player.vy = 0;
        player.jumping = false;
        player.jumps = 0;
        landed = true;
    }
    // Floating block collision
    for (let b of floatingBlocks) {
        if (
            player.x + player.w > b.x && player.x < b.x + b.w &&
            player.y + player.h > b.y && player.y + player.h - player.vy <= b.y + 8 &&
            player.vy >= 0
        ) {
            player.y = b.y - player.h;
            player.vy = 0;
            player.jumping = false;
            player.jumps = 0;
            landed = true;
        }
    }
    // Obstacles
    for (let ob of obstacles) ob.x -= speed;
    for (let b of floatingBlocks) b.x -= speed;
    if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width / 2) {
        if (Math.random() < 0.9) spawnObstacle();
    }
    if (floatingBlocks.length === 0 || floatingBlocks[floatingBlocks.length - 1].x < canvas.width / 2.5) {
        if (Math.random() < 0.7) spawnFloatingBlock();
    }
    obstacles = obstacles.filter(ob => ob.x + ob.w > 0);
    floatingBlocks = floatingBlocks.filter(b => b.x + b.w > 0);
    // Collision
    for (let ob of obstacles) {
        let collide = false;
        if (ob.shape === 'rect') {
            collide = player.x < ob.x + ob.w && player.x + player.w > ob.x && player.y < ob.y + ob.h && player.y + player.h > ob.y;
        } else if (ob.shape === 'triangle') {
            collide = player.x < ob.x + ob.w && player.x + player.w > ob.x && player.y < ob.y + ob.h && player.y + player.h > ob.y;
        } else if (ob.shape === 'circle') {
            let dx = (ob.x + ob.w / 2) - (player.x + player.w / 2);
            let dy = (ob.y + ob.h / 2) - (player.y + player.h / 2);
            let dist = Math.sqrt(dx * dx + dy * dy);
            collide = dist < ob.w / 2 + player.w / 2 - 8;
        } else if (ob.shape === 'star') {
            let dx = (ob.x + ob.w / 2) - (player.x + player.w / 2);
            let dy = (ob.y + ob.w / 2) - (player.y + player.h / 2);
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < ob.w / 2 + player.w / 2 - 8) {
                player.vy = -32; // boost up
                player.jumping = true;
                player.spinning = true;
                player.jumps = 1; // allow one more jump after boost
                ob.x = -9999;
                continue;
            }
        } else if (ob.shape === 'diamond') {
            collide = player.x < ob.x + ob.w && player.x + player.w > ob.x && player.y < ob.y + ob.h && player.y + player.h > ob.y;
        } else if (ob.shape === 'octagon') {
            let dx = (ob.x + ob.w / 2) - (player.x + player.w / 2);
            let dy = (ob.y + ob.h / 2) - (player.y + player.h / 2);
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < ob.w / 2 + player.w / 2 - 8 && !isFlipped) {
                isFlipped = true;
                flipTimer = 180; // 3 seconds at 60fps
                ob.x = -9999;
                continue;
            }
        }
        if (collide && !isFlipped) gameOver = true;
    }
    // Flip timer
    if (isFlipped) {
        flipTimer--;
        if (flipTimer <= 0) isFlipped = false;
    }
    // Score
    score++;
    scoreDiv.textContent = 'Score: ' + score;
}

function draw() {
    ctx.save();
    if (isFlipped) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(Math.PI);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGround();
    drawFloatingBlocks();
    drawPlayer();
    drawObstacles();
    ctx.restore();
    if (gameOver) {
        ctx.save();
        ctx.globalAlpha = 0.92;
        ctx.fillStyle = '#12003a';
        ctx.fillRect(0, canvas.height / 2 - 80, canvas.width, 160);
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#00fff7';
        ctx.font = 'bold 2em Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
        ctx.font = '1.2em Segoe UI';
        ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 + 40);
        ctx.font = '1em Segoe UI';
        ctx.fillText('Press Space to Restart', canvas.width / 2, canvas.height / 2 + 80);
        ctx.restore();
    }
}

function gameLoop() {
    update();
    draw();
    if (!gameOver) requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', e => {
    if ((e.code === 'Space' || e.code === 'ArrowUp') && player.jumps < 2 && !gameOver) {
        player.vy = -jumpPower;
        player.jumping = true;
        player.spinning = true;
        player.jumps++;
    }
    if (gameOver && e.code === 'Space') {
        // Restart
        player = { x: 80, y: canvas.height - 100 - 72, w: 72, h: 72, vy: 0, jumping: false, angle: 0, spinning: false, jumps: 0 };
        obstacles = [];
        floatingBlocks = [];
        score = 0;
        gameOver = false;
        gameLoop();
    }
});

// Adjust player and obstacles on resize
window.addEventListener('resize', () => {
    if (player.y + player.h > groundY() + 36) {
        player.y = groundY() + 36 - player.h;
        player.vy = 0;
        player.jumping = false;
        player.angle = 0;
        player.spinning = false;
    }
    obstacles.forEach(ob => {
        ob.y = groundY() + 36 - ob.h;
    });
    floatingBlocks.forEach(b => {
        b.y = groundY() - 80 - Math.random() * 80;
    });
});

gameLoop();
