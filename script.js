
// Declaration des variables d'environnement
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext("2d");

// Polyfill pour roundRect
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
        const r = Array.isArray(radii) ? radii[0] : (radii || 0);
        if (r === 0) {
            this.rect(x, y, w, h);
            return this;
        }
        this.moveTo(x + r, y);
        this.lineTo(x + w - r, y);
        this.arcTo(x + w, y, x + w, y + r, r);
        this.lineTo(x + w, y + h - r);
        this.arcTo(x + w, y + h, x + w - r, y + h, r);
        this.lineTo(x + r, y + h);
        this.arcTo(x, y + h, x, y + h - r, r);
        this.lineTo(x, y + r);
        this.arcTo(x, y, x + r, y, r);
        return this;
    };
}

// Variable gerant la position et le deplaceemnt de la balle 
let x = canvas.width / 2;
let y = canvas.height - 30;
    //deplacement
let dx = 2.5;
let dy = -2.5;
    //rayon de la balle
let ballRadius = 10;
    //taille et placement de la 'raquette'
let paddleHeight = 15;
let paddleWidth = 100;
let paddleX = (canvas.width - paddleWidth) / 2;
    // stocke l'etat des touches 'gauche' et 'droite' 
let rightPressed = false; 
let leftPressed = false;
    //Stocke la notification Game over 
const gameOverNotify = document.querySelector('.game-over-notify-overlay');
    //Stocke la notification de Victoire
const winNotify = document.querySelector('.win-notify-overlay');
    //Definie le bouton 'rejouer'
const replayBtn = document.querySelectorAll('.replay-btn');
    //Stock les donnes d'affichage des briques au sein du tableau 
let brickRowCount = 5; 
let brickColumnCount = 7;
let brickWidth = 77;
let brickHeight = 25;
let brickPadding = 30;
let brickOffsetTop = 50;
let brickOffsetLeft = 30;
    //index de score
let score = 0;
    //Nombre de vies
let lives = 3;
    //Niveau actuel
let level = 1;
    //Systeme de particules
let particles = [];
    //Trail de la balle
let ballTrail = [];
    //Items qui tombent
let items = [];

// Couleurs des briques (arc-en-ciel)
const brickColors = [
    ['#FF6B9D', '#C44569'],  // Rose/Rouge
    ['#FFA07A', '#FF6347'],  // Orange
    ['#FFD700', '#FFA500'],  // Jaune/Or
    ['#98D8C8', '#2ECC71'],  // Vert
    ['#6C5CE7', '#A29BFE']   // Violet/Bleu
];

//Tableau de stockage des briques avec couleurs
let bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1, color: brickColors[r] };
    }
}

// Classe pour les particules optimisée
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8;
        this.life = 1;
        this.decay = Math.random() * 0.03 + 0.03;
        this.size = Math.random() * 3 + 2;
        this.color = color;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.3;
        this.life -= this.decay;
    }

    draw() {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color[0];
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

// Types d'items disponibles
const ITEM_TYPES = [
    { type: 'expand',  color: '#00FF00', darkColor: '#00AA00', symbol: '⇔' },
    { type: 'shrink',  color: '#FF4444', darkColor: '#AA0000', symbol: '⇒⇐' },
    { type: 'slow',    color: '#4488FF', darkColor: '#0044AA', symbol: '▼' },
    { type: 'fast',    color: '#FF44FF', darkColor: '#AA00AA', symbol: '▲' },
    { type: 'life',    color: '#FFD700', darkColor: '#CC9900', symbol: '♥' }
];

// Classe Item
class Item {
    constructor(brickX, brickY) {
        this.x = brickX;
        this.y = brickY;
        this.w = 28;
        this.h = 28;
        this.vy = 2;
        this.active = true;
        // Choisir un type aléatoire
        const t = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
        this.type = t.type;
        this.color = t.color;
        this.darkColor = t.darkColor;
        this.symbol = t.symbol;
    }

    update() {
        this.y += this.vy;
        if (this.y > canvas.height) this.active = false;
    }

    draw() {
        // Fond avec gradient
        const g = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.h);
        g.addColorStop(0, this.color);
        g.addColorStop(1, this.darkColor);
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.w, this.h, 6);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Symbole
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.symbol, this.x + this.w / 2, this.y + this.h / 2);
    }

    checkPaddleCollision() {
        if (this.y + this.h >= canvas.height - paddleHeight &&
            this.y + this.h <= canvas.height &&
            this.x + this.w >= paddleX &&
            this.x <= paddleX + paddleWidth) {
            this.active = false;
            this.applyEffect();
        }
    }

    applyEffect() {
        switch (this.type) {
            case 'expand':
                paddleWidth = Math.min(paddleWidth + 25, 180);
                setTimeout(function() { paddleWidth = 100; }, 10000);
                break;
            case 'shrink':
                paddleWidth = Math.max(paddleWidth - 25, 45);
                setTimeout(function() { paddleWidth = 100; }, 8000);
                break;
            case 'slow':
                dx *= 0.7; dy *= 0.7;
                setTimeout(function() { dx /= 0.7; dy /= 0.7; }, 8000);
                break;
            case 'fast':
                dx *= 1.4; dy *= 1.4;
                setTimeout(function() { dx /= 1.4; dy /= 1.4; }, 6000);
                break;
            case 'life':
                if (lives < 3) {
                    lives++;
                    if (lives >= 3) document.querySelector('.live-3').style.display = 'block';
                    if (lives >= 2) document.querySelector('.live-2').style.display = 'block';
                }
                break;
        }
    }
}

// Fonction pour dessiner et mettre à jour les items
function updateItems() {
    for (let i = items.length - 1; i >= 0; i--) {
        items[i].update();
        items[i].draw();
        items[i].checkPaddleCollision();
        if (!items[i].active) items.splice(i, 1);
    }
}



// Ecouteurs d'evenements pour les touches clavier
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

// Ecouteur d'enevement au click pour les boutons 'rejouer' afin de recharger la page 
for (let i = 0; i < replayBtn.length; i++) {
    replayBtn[i].addEventListener('click', function() {
        this.style.boxShadow = 'inset -7px -6px 12px rgba(0, 0, 95, 1)'
        this.style.color = 'rgba(255, 255, 255, 0.5)'
        document.location.reload();
    })
};


//Ecouteur d'evenement mouse hover pour l'interaction au passage de la souris 
for (let i = 0; i < replayBtn.length; i++) {
    replayBtn[i].addEventListener('mouseenter', function() {
        this.style.boxShadow = 'inset -4px -3px 8px rgba(2, 2, 160, 1)'
    })
};
for (let i = 0; i < replayBtn.length; i++) {
    replayBtn[i].addEventListener('mouseleave', function() {
        this.style.boxShadow = 'inset 4px 3px 8px rgb(248, 233, 213)'
    })
};

//Ecouteur d'evenement mouse down/up pour l'interaction au click et relacher de la souris
for (let i = 0; i < replayBtn.length; i++) {
    replayBtn[i].addEventListener('mousedown', function() {
        this.style.boxShadow = 'inset -7px -6px 12px rgba(0, 0, 95, 1)'
        this.style.color = 'rgba(255, 255, 255, 0.5)'
    })
};
for (let i = 0; i < replayBtn.length; i++) {
    replayBtn[i].addEventListener('mouseup', function() {
        this.style.boxShadow = 'inset -4px -3px 8px rgba(2, 2, 160, 1)'
        this.style.color = 'rgb(248, 233, 213)'
    })
};





// Fonction permettant de detecter la touche pressee 
function keyDownHandler (e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = true;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
    }
}



// Fonction permettant de detecter la touche relachee
function keyUpHandler (e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = false;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = false;
    }
}



// Function permattant de dessiner la balle 
function drawBall () {
    // Trail simplifié
    ballTrail.push({x: x, y: y});
    if (ballTrail.length > 4) ballTrail.shift();

    // Dessiner le trail
    for (let i = 0; i < ballTrail.length; i++) {
        const point = ballTrail[i];
        const alpha = (i / ballTrail.length) * 0.25;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#00D4FF';
        ctx.beginPath();
        ctx.arc(point.x, point.y, ballRadius * 0.6, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Gradient pour la balle
    const gradient = ctx.createRadialGradient(x - 3, y - 3, 0, x, y, ballRadius);
    gradient.addColorStop(0, '#FFFFFF');
    gradient.addColorStop(0.4, '#00D4FF');
    gradient.addColorStop(1, '#0095DD');

    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Reflet
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x - 3, y - 3, ballRadius * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
}



// Fonction permettant de dessiner la raquette
function drawPaddle () {
    const paddleY = canvas.height - paddleHeight;

    // Gradient pour la raquette
    const gradient = ctx.createLinearGradient(paddleX, paddleY, paddleX, paddleY + paddleHeight);
    gradient.addColorStop(0, '#00D4FF');
    gradient.addColorStop(0.5, '#0095DD');
    gradient.addColorStop(1, '#004D73');

    ctx.beginPath();
    ctx.roundRect(paddleX, paddleY, paddleWidth, paddleHeight, [8, 8, 0, 0]);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Bordure
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Reflet simple
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(paddleX + 4, paddleY + 2, paddleWidth - 8, 3);
    ctx.globalAlpha = 1;
}



// Function permattant de definir le placement de chaque briques ainsi que de les dessiner
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status == 1) {
                let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;

                // Gradient pour la brique
                const gradient = ctx.createLinearGradient(brickX, brickY, brickX, brickY + brickHeight);
                gradient.addColorStop(0, bricks[c][r].color[0]);
                gradient.addColorStop(1, bricks[c][r].color[1]);

                ctx.beginPath();
                ctx.roundRect(brickX, brickY, brickWidth, brickHeight, 8);
                ctx.fillStyle = gradient;
                ctx.fill();

                // Bordure
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Reflet
                ctx.globalAlpha = 0.5;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fillRect(brickX + 4, brickY + 3, brickWidth - 8, 4);
                ctx.globalAlpha = 1;
            }
        }
    }
}



//Fonction de detction des collisions entre la balle et les briques 
function detectionCollision() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status == 1) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score++;

                    // Créer des particules
                    const centerX = b.x + brickWidth / 2;
                    const centerY = b.y + brickHeight / 2;
                    for (let i = 0; i < 12; i++) {
                        particles.push(new Particle(centerX, centerY, b.color));
                    }

                    // 30% de chance de lâcher un item
                    if (Math.random() < 0.3) {
                        items.push(new Item(centerX - 14, centerY));
                    }

                    // Vérifier si toutes les briques sont détruites
                    let allDestroyed = true;
                    for (let cc = 0; cc < brickColumnCount; cc++) {
                        for (let rr = 0; rr < brickRowCount; rr++) {
                            if (bricks[cc][rr].status === 1) { allDestroyed = false; break; }
                        }
                        if (!allDestroyed) break;
                    }
                    if (allDestroyed) {
                        if (level === 1) {
                            startLevel2();
                        } else {
                            clearInterval(interval);
                            winNotify.style.display = 'flex';
                        }
                    }
                }
            }
        }
    }
}

// Fonction pour mettre à jour les particules
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }
}



// Fonction pour lancer le niveau 2
function startLevel2() {
    level = 2;
    // Réinitialiser balle et raquette
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = 3;
    dy = -3;
    paddleWidth = 100;
    paddleX = (canvas.width - paddleWidth) / 2;
    // Vider items et particules
    items = [];
    particles = [];
    ballTrail = [];

    // Nouvelles briques : 6 rangées x 7 colonnes (même largeur, rentre dans le canvas)
    brickRowCount = 6;
    brickColumnCount = 7;
    const level2Colors = [
        ['#FF1744', '#C62828'],
        ['#FF6B9D', '#C44569'],
        ['#FFA07A', '#FF6347'],
        ['#FFD700', '#FFA500'],
        ['#2ECC71', '#27AE60'],
        ['#6C5CE7', '#5B4ACE']
    ];
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1, color: level2Colors[r] };
        }
    }
}

//Fonction permettant d'afficher le score et le niveau
function drawScore () {
    document.getElementById('score').textContent = `Score : ${score} | Niv. ${level}`
};



//Fonction permettant l'affichage des vie
function drawLives () {
    if (lives == 2) {
        document.querySelector('.live-3').style.display = 'none'
    } else if (lives == 1) {
        document.querySelector('.live-2').style.display = 'none'
    } 
};


// fonction permettant d'effacer et redessiner la balle ainsi que le reste du canvas grace a 
// ces differentes fonctions intgrees vus plus haut 
// position differente a chaque frame 
function draw () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    updateParticles();
    updateItems();
    drawBall();
    drawPaddle();
    detectionCollision();
    drawScore();
    drawLives();
    

    // Si la balle 'touche' un mur, elle rebondit dans la direction oppose
        // A gauche et a droite
    if (x + dx < ballRadius || x + dx  > canvas.width-ballRadius) {
        dx = -dx;
    }
        // en haut
    if (y + dy < ballRadius) {
        dy = -dy;
    }
        // en bas : collision avec la raquette ou perte de vie
    const paddleTop = canvas.height - paddleHeight;
    const nextY = y + dy;
    const nextX = x + dx;

    if (nextY + ballRadius >= paddleTop && y - ballRadius <= paddleTop) {
        // La balle est au niveau de la raquette : vérifier si elle la touche
        // On prend une zone de détection élargie du rayon de la balle
        if (nextX + ballRadius >= paddleX && nextX - ballRadius <= paddleX + paddleWidth) {
            dy = -Math.abs(dy); // Toujours rebondir vers le haut
            y = paddleTop - ballRadius; // Repositionner au-dessus de la raquette
        }
    }

    if (nextY + ballRadius > canvas.height) {
        // La balle est sortie par le bas
        lives = lives - 1;
        if (!lives) {
            document.querySelector('.live-1').style.display = 'none';
            gameOverNotify.style.display = 'flex';
            clearInterval(interval);
            return;
        } else {
            x = canvas.width / 2;
            y = canvas.height - 30;
            dx = level === 1 ? 2.5 : 3;
            dy = level === 1 ? -2.5 : -3;
            paddleX = (canvas.width - paddleWidth) / 2;
        }
    }

    

    // Deplacement de la raquette de gauche a droite a l'aide des touches  ==> possiblite de reduire le code 
    if (rightPressed) {
    paddleX += 10; 
    if (paddleX + paddleWidth > canvas.width) {
        paddleX = canvas.width - paddleWidth;
    }
    } else if (leftPressed) {
        paddleX -= 10;
        if (paddleX < 0) {
            paddleX = 0;
        }
    }

    // Deplacement de la balle 
    x += dx;
    y += dy;
}



// stocke et appelle la fonction d'appel a intervale regulier permettant au jeu de demarrer
let interval = setInterval(draw, 10);















