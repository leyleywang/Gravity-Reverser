class Game {
    constructor() {
        this.gameWorld = document.getElementById('game-world');
        this.character = document.getElementById('character');
        this.levelElement = document.getElementById('level');
        this.gravityText = document.getElementById('gravity-text');
        this.gravityIcon = document.getElementById('gravity-icon');
        this.gameOverlay = document.getElementById('game-overlay');
        this.overlayTitle = document.getElementById('overlay-title');
        this.overlayMessage = document.getElementById('overlay-message');
        this.restartBtn = document.getElementById('restart-btn');
        
        this.level = 1;
        this.gravity = 'down';
        this.isPlaying = false;
        this.obstacles = [];
        this.platforms = [];
        
        // 角色移动相关属性
        this.characterSpeed = 2.5; // 稍微降低水平速度，让玩家有更多反应时间
        this.characterVerticalSpeed = 0;
        this.gravityForce = 0.25; // 稍微降低重力，让角色移动更加流畅
        this.maxVerticalSpeed = 6; // 降低最大垂直速度，让玩家更容易控制
        
        // 障碍物和平台速度
        this.obstacleSpeed = 1.8; // 稍微降低初始障碍物速度
        this.platformSpeed = 1.2; // 稍微降低初始平台速度
        
        // 地面和天花板位置
        this.groundY = 50;
        this.ceilingY = 50;
        
        this.gameLoopId = null;
        
        this.init();
    }
    
    init() {
        this.gameWorld.addEventListener('click', () => {
            if (!this.isPlaying) {
                this.startGame();
            } else {
                this.toggleGravity();
            }
        });
        
        this.restartBtn.addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    startGame() {
        this.isPlaying = true;
        this.gameOverlay.style.display = 'none';
        this.resetLevel();
        this.gameLoop();
    }
    
    restartGame() {
        this.level = 1;
        this.obstacleSpeed = 2;
        this.platformSpeed = 1.5;
        this.isPlaying = false;
        this.clearObstacles();
        this.clearPlatforms();
        this.resetCharacter();
        this.updateLevelDisplay();
        this.gameOverlay.style.display = 'flex';
        this.overlayTitle.textContent = 'Gravity Reverser';
        this.overlayMessage.textContent = 'Click to start';
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
        }
    }
    
    resetLevel() {
        this.clearObstacles();
        this.clearPlatforms();
        this.resetCharacter();
        this.generateObstacles();
        this.generatePlatforms();
    }
    
    resetCharacter() {
        const worldHeight = this.gameWorld.clientHeight;
        const characterHeight = this.character.clientHeight;
        
        this.character.style.left = '50px';
        // 使用top定位，初始位置在地面
        const initialTop = worldHeight - this.groundY - characterHeight;
        this.character.style.top = `${initialTop}px`;
        this.character.style.bottom = 'auto';
        this.character.classList.remove('reversed');
        
        // 重置重力和垂直速度
        this.gravity = 'down';
        this.characterVerticalSpeed = 0;
        this.updateGravityDisplay();
    }
    
    toggleGravity() {
        this.gravity = this.gravity === 'down' ? 'up' : 'down';
        this.updateGravityDisplay();
        
        if (this.gravity === 'up') {
            this.character.classList.add('reversed');
            // 给角色一个向上的初始速度（负的，因为top减少意味着向上移动）
            this.characterVerticalSpeed = -this.maxVerticalSpeed;
        } else {
            this.character.classList.remove('reversed');
            // 给角色一个向下的初始速度（正的，因为top增加意味着向下移动）
            this.characterVerticalSpeed = this.maxVerticalSpeed;
        }
    }
    
    updateGravityDisplay() {
        this.gravityText.textContent = `Gravity: ${this.gravity.charAt(0).toUpperCase() + this.gravity.slice(1)}`;
        if (this.gravity === 'up') {
            this.gravityIcon.classList.add('reversed');
        } else {
            this.gravityIcon.classList.remove('reversed');
        }
    }
    
    generateObstacles() {
        const obstacleCount = Math.min(3 + this.level, 8);
        const worldHeight = this.gameWorld.clientHeight;
        
        for (let i = 0; i < obstacleCount; i++) {
            const obstacle = document.createElement('div');
            obstacle.classList.add('obstacle');
            
            const width = Math.random() * 30 + 20;
            const height = Math.random() * 30 + 20;
            
            obstacle.style.width = `${width}px`;
            obstacle.style.height = `${height}px`;
            
            // 让障碍物分布在整个游戏区域，不仅仅是顶部和底部
            // 确保障碍物在中间区域，让角色需要在上下平面之间穿梭来避开它们
            const minY = this.groundY + 50;
            const maxY = worldHeight - this.ceilingY - height - 50;
            const obstacleY = Math.random() * (maxY - minY) + minY;
            
            // 随机决定障碍物是靠近地面还是靠近天花板
            const isNearGround = Math.random() > 0.5;
            if (isNearGround) {
                // 靠近地面
                const groundObstacleY = Math.random() * 100 + this.groundY;
                obstacle.style.bottom = `${groundObstacleY}px`;
                obstacle.style.top = 'auto';
            } else {
                // 靠近天花板
                const ceilingObstacleY = Math.random() * 100 + this.ceilingY;
                obstacle.style.top = `${ceilingObstacleY}px`;
                obstacle.style.bottom = 'auto';
            }
            
            // 也有一些障碍物在中间区域
            if (Math.random() > 0.5) {
                // 中间区域的障碍物
                const middleY = Math.random() * (worldHeight - 200) + 100;
                obstacle.style.top = `${middleY}px`;
                obstacle.style.bottom = 'auto';
            }
            
            obstacle.style.left = `${window.innerWidth + i * 200}px`;
            this.gameWorld.appendChild(obstacle);
            this.obstacles.push(obstacle);
        }
    }
    
    generatePlatforms() {
        if (this.level >= 3) {
            const platformCount = Math.min(1 + Math.floor(this.level / 2), 3);
            
            for (let i = 0; i < platformCount; i++) {
                const platform = document.createElement('div');
                platform.classList.add('platform');
                
                platform.style.width = '100px';
                platform.style.height = '15px';
                
                const isTop = Math.random() > 0.5;
                if (isTop) {
                    platform.style.top = '150px';
                } else {
                    platform.style.bottom = '150px';
                }
                
                platform.style.left = `${window.innerWidth + i * 300}px`;
                this.gameWorld.appendChild(platform);
                this.platforms.push(platform);
            }
        }
    }
    
    clearObstacles() {
        this.obstacles.forEach(obstacle => {
            if (obstacle.parentNode) {
                obstacle.parentNode.removeChild(obstacle);
            }
        });
        this.obstacles = [];
    }
    
    clearPlatforms() {
        this.platforms.forEach(platform => {
            if (platform.parentNode) {
                platform.parentNode.removeChild(platform);
            }
        });
        this.platforms = [];
    }
    
    updateCharacter() {
        const worldHeight = this.gameWorld.clientHeight;
        const characterHeight = this.character.clientHeight;
        
        // 水平移动
        const currentLeft = parseInt(this.character.style.left) || 50;
        const newLeft = currentLeft + this.characterSpeed;
        this.character.style.left = `${newLeft}px`;
        
        // 检查是否到达终点
        if (newLeft > window.innerWidth - 50 - this.character.clientWidth) {
            this.levelComplete();
            return;
        }
        
        // 垂直移动 - 应用重力
        if (this.gravity === 'down') {
            // 重力向下，角色应该向地面移动
            this.characterVerticalSpeed += this.gravityForce;
        } else {
            // 重力向上，角色应该向天花板移动
            this.characterVerticalSpeed -= this.gravityForce;
        }
        
        // 限制最大速度
        if (this.characterVerticalSpeed > this.maxVerticalSpeed) {
            this.characterVerticalSpeed = this.maxVerticalSpeed;
        } else if (this.characterVerticalSpeed < -this.maxVerticalSpeed) {
            this.characterVerticalSpeed = -this.maxVerticalSpeed;
        }
        
        // 获取当前角色位置 - 统一使用top定位来计算
        let currentTop;
        if (this.character.style.top !== 'auto' && this.character.style.top) {
            currentTop = parseInt(this.character.style.top);
        } else if (this.character.style.bottom !== 'auto' && this.character.style.bottom) {
            // 如果使用的是bottom定位，转换为top
            const currentBottom = parseInt(this.character.style.bottom);
            currentTop = worldHeight - currentBottom - characterHeight;
        } else {
            // 默认位置
            currentTop = worldHeight - this.groundY - characterHeight;
        }
        
        // 计算新的top位置
        // 当characterVerticalSpeed为正时，角色向下移动（top增加）
        // 当characterVerticalSpeed为负时，角色向上移动（top减少）
        let newTop = currentTop + this.characterVerticalSpeed;
        
        // 限制角色在游戏世界内移动
        const minTop = this.ceilingY;
        const maxTop = worldHeight - this.groundY - characterHeight;
        
        if (newTop <= minTop) {
            // 角色到达天花板
            newTop = minTop;
            this.characterVerticalSpeed = 0;
        } else if (newTop >= maxTop) {
            // 角色到达地面
            newTop = maxTop;
            this.characterVerticalSpeed = 0;
        }
        
        // 设置角色位置
        this.character.style.top = `${newTop}px`;
        this.character.style.bottom = 'auto';
    }
    
    updateObstacles() {
        this.obstacles.forEach(obstacle => {
            const currentLeft = parseInt(obstacle.style.left);
            const newLeft = currentLeft - this.obstacleSpeed;
            obstacle.style.left = `${newLeft}px`;
            
            if (newLeft < -obstacle.clientWidth) {
                obstacle.style.left = `${window.innerWidth}px`;
            }
        });
    }
    
    updatePlatforms() {
        this.platforms.forEach(platform => {
            const currentLeft = parseInt(platform.style.left);
            const newLeft = currentLeft - this.platformSpeed;
            platform.style.left = `${newLeft}px`;
            
            if (newLeft < -platform.clientWidth) {
                platform.style.left = `${window.innerWidth}px`;
            }
        });
    }
    
    checkCollisions() {
        const characterRect = this.character.getBoundingClientRect();
        const worldRect = this.gameWorld.getBoundingClientRect();
        
        // Check obstacle collisions
        for (const obstacle of this.obstacles) {
            const obstacleRect = obstacle.getBoundingClientRect();
            if (this.isColliding(characterRect, obstacleRect)) {
                this.character.classList.add('collision');
                setTimeout(() => {
                    this.character.classList.remove('collision');
                }, 300);
                this.resetLevel();
                return;
            }
        }
        
        // Check platform collisions - 角色可以站在平台上
        let onPlatform = false;
        for (const platform of this.platforms) {
            const platformRect = platform.getBoundingClientRect();
            
            // 检查角色是否与平台碰撞
            if (this.isColliding(characterRect, platformRect)) {
                onPlatform = true;
                
                // 根据重力方向和角色位置，确定角色应该站在平台的哪一侧
                if (this.gravity === 'down') {
                    // 重力向下，角色应该站在平台顶部
                    // 检查角色是否正在向下移动并从上方接近平台
                    if (this.characterVerticalSpeed >= 0) {
                        // 角色从上方碰撞到平台，让角色站在平台顶部
                        const platformTop = platformRect.top - worldRect.top;
                        const characterHeight = characterRect.height;
                        
                        this.character.style.top = `${platformTop - characterHeight}px`;
                        this.character.style.bottom = 'auto';
                        this.characterVerticalSpeed = 0;
                    }
                } else {
                    // 重力向上，角色应该站在平台底部
                    // 检查角色是否正在向上移动并从下方接近平台
                    if (this.characterVerticalSpeed <= 0) {
                        // 角色从下方碰撞到平台，让角色站在平台底部
                        // 使用top定位，角色的top应该等于平台的bottom
                        const platformBottom = platformRect.bottom - worldRect.top;
                        
                        this.character.style.top = `${platformBottom}px`;
                        this.character.style.bottom = 'auto';
                        this.characterVerticalSpeed = 0;
                    }
                }
                break;
            }
        }
        
        // 如果角色不在平台上，确保它最终会回到地面或天花板
        if (!onPlatform) {
            // 这里不强制角色回到地面或天花板，而是让重力自然地拉它
            // 这样角色就可以在重力作用下自然地在上下平面之间移动
        }
    }
    
    isColliding(rect1, rect2) {
        return (
            rect1.left < rect2.right &&
            rect1.right > rect2.left &&
            rect1.top < rect2.bottom &&
            rect1.bottom > rect2.top
        );
    }
    
    levelComplete() {
        this.level++;
        this.obstacleSpeed += 0.3;
        this.platformSpeed += 0.2;
        this.updateLevelDisplay();
        
        // Show level up animation
        const levelUpElement = document.createElement('div');
        levelUpElement.classList.add('level-up');
        levelUpElement.textContent = 'Level Up!';
        this.gameWorld.appendChild(levelUpElement);
        
        setTimeout(() => {
            if (levelUpElement.parentNode) {
                levelUpElement.parentNode.removeChild(levelUpElement);
            }
        }, 1000);
        
        this.resetLevel();
    }
    
    updateLevelDisplay() {
        this.levelElement.textContent = this.level;
    }
    
    gameLoop() {
        if (!this.isPlaying) return;
        
        this.updateCharacter();
        this.updateObstacles();
        this.updatePlatforms();
        this.checkCollisions();
        
        this.gameLoopId = requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});