let player = document.getElementById("player");
let body = document.body;
let cobblestone1 = document.getElementById("cobblestone1");
let cobblestone2 = document.getElementById("cobblestone2");
let keysHeld = {};
let zombie = document.getElementById("zombie");
let gold = document.getElementById("gold");
let isPlayerAlive = true;

// Initialize jump and velocity properties on player
player.velocityY = 0;
player.isJumping = false;

document.addEventListener("keydown", (e) => {
  keysHeld[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup", (e) => {
  keysHeld[e.key.toLowerCase()] = false;
});

function updatePlayer() {
  let newTop = player.offsetTop;
  let newLeft = player.offsetLeft;

  // Horizontal movement
  if (keysHeld["a"]) {
    newLeft = Math.max(0, player.offsetLeft - 15);
    player.style.backgroundImage = 'url("assets/runLeft.png")';
    player.style.backgroundSize = "cover";
    player.style.width = "200px";
  } else if (keysHeld["d"]) {
    newLeft = Math.min(
      body.offsetWidth - player.offsetWidth,
      player.offsetLeft + 15
    );
    player.style.backgroundImage = 'url("assets/runRight.png")';
    player.style.backgroundSize = "cover";
    player.style.width = "200px";
  }

  // Jump initiation
  if (keysHeld["w"] && !player.isJumping) {
    player.velocityY = -20; // jump strength
    player.isJumping = true;
    player.style.backgroundImage = 'url("assets/jumpUp.png")';
    player.style.width = "210px";
  }

  // Gravity
  player.velocityY += 1; // gravity strength

  // Apply vertical movement
  newTop += player.velocityY;
  const ground = body.offsetHeight;

  // Get all rectangles for collision detection
  const playerRect = {
    top: newTop,
    left: newLeft,
    right: newLeft + player.offsetWidth,
    bottom: newTop + player.offsetHeight,
  };

  const cobbleRects = [
    {
      element: cobblestone1,
      rect: cobblestone1.getBoundingClientRect(),
    },
    {
      element: cobblestone2,
      rect: cobblestone2.getBoundingClientRect(),
    },
  ];

  // Collision flags
  let collisionTop = false;
  let collisionBottom = false;
  let collisionLeft = false;
  let collisionRight = false;

  // Cobblestone collision
  for (const cobble of cobbleRects) {
    const cobbleRect = cobble.rect;
    const cobbleTop = cobbleRect.top - body.getBoundingClientRect().top + 10;
    const cobbleLeft = cobbleRect.left - body.getBoundingClientRect().left - 97;

    const cobbleRectAdjusted = {
      top: cobbleTop,
      left: cobbleLeft + 152.5,
      right: cobbleLeft + cobbleRect.width,
      bottom: cobbleTop + cobbleRect.height,
    };

    if (
      playerRect.right > cobbleRectAdjusted.left &&
      playerRect.left < cobbleRectAdjusted.right &&
      playerRect.bottom > cobbleRectAdjusted.top &&
      playerRect.top < cobbleRectAdjusted.bottom
    ) {
      const overlapTop = playerRect.bottom - cobbleRectAdjusted.top;
      const overlapBottom = cobbleRectAdjusted.bottom - playerRect.top;
      const overlapLeft = playerRect.right - cobbleRectAdjusted.left;
      const overlapRight = cobbleRectAdjusted.right - playerRect.left;

      const minOverlap = Math.min(
        overlapTop,
        overlapBottom,
        overlapLeft,
        overlapRight
      );

      if (minOverlap === overlapTop) {
        newTop = cobbleRectAdjusted.top - player.offsetHeight;
        player.velocityY = 0;
        player.isJumping = false;
        collisionTop = true;
      } else if (minOverlap === overlapBottom) {
        newTop = cobbleRectAdjusted.bottom;
        player.velocityY = 0;
        collisionBottom = true;
      } else if (minOverlap === overlapLeft) {
        newLeft = cobbleRectAdjusted.left - player.offsetWidth;
        collisionLeft = true;
      } else if (minOverlap === overlapRight) {
        newLeft = cobbleRectAdjusted.right;
        collisionRight = true;
      }
    }
  }

  // Zombie collision
  const zombieRect = zombie.getBoundingClientRect();
  const zombieTop = zombieRect.top - body.getBoundingClientRect().top;
  const zombieLeft = zombieRect.left - body.getBoundingClientRect().left;
  const zombieRectAdjusted = {
    top: zombieTop,
    left: zombieLeft,
    right: zombieLeft + zombieRect.width,
    bottom: zombieTop + zombieRect.height,
  };
  if (
    playerRect.right > zombieRectAdjusted.left &&
    playerRect.left < zombieRectAdjusted.right &&
    playerRect.bottom > zombieRectAdjusted.top &&
    playerRect.top < zombieRectAdjusted.bottom
  ) {
    const overlapTop = playerRect.bottom - zombieRectAdjusted.top;
    const overlapBottom = zombieRectAdjusted.bottom - playerRect.top;
    const overlapLeft = playerRect.right - zombieRectAdjusted.left;
    const overlapRight = zombieRectAdjusted.right - playerRect.left;

    const minOverlap = Math.min(
      overlapTop,
      overlapBottom,
      overlapLeft,
      overlapRight
    );

    // Show popup and stop game loop
    function showGameOverPopup() {
      if (document.getElementById("gameOverPopup")) return;
      const popup = document.createElement("div");
      popup.id = "gameOverPopup";
      popup.style.position = "fixed";
      popup.style.top = "50%";
      popup.style.left = "50%";
      popup.style.transform = "translate(-50%, -50%)";
      popup.style.background = "rgba(205, 92, 92, 0.95)";
      popup.style.borderRadius = "10%";
      popup.style.padding = "30px 50px";
      popup.style.zIndex = "9999";
      popup.style.fontSize = "2rem";
      popup.style.textAlign = "center";
      popup.innerHTML = `
        <div>You died!<br><p style="font-size:1rem">*The zombie's attacks reach long distances</p><br>
        <button id="tryAgainBtn" style="font-size:1.2rem;font-weight:599;padding:10px 30px;margin-top:20px;">Try Again</button>
        </div>
      `;
      // Add a transparent overlay to block all interactions
      const overlay = document.createElement("div");
      overlay.id = "gameOverOverlay";
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100vw";
      overlay.style.height = "100vh";
      overlay.style.background = "rgba(0,0,0,0.2)";
      overlay.style.zIndex = "9998";
      overlay.style.pointerEvents = "auto";
      document.body.appendChild(overlay);
      document.body.appendChild(popup);

      // Prevent all key and mouse events except on the Try Again button
      function blockEvent(e) {
        if (!popup.contains(e.target)) {
          e.stopPropagation();
          e.preventDefault();
        }
      }
      document.addEventListener("keydown", blockEvent, true);
      document.addEventListener("keyup", blockEvent, true);
      document.addEventListener("mousedown", blockEvent, true);
      document.addEventListener("touchstart", blockEvent, true);

      document.getElementById("tryAgainBtn").onclick = () => {
        popup.remove();
        overlay.remove();
        document.removeEventListener("keydown", blockEvent, true);
        document.removeEventListener("keyup", blockEvent, true);
        document.removeEventListener("mousedown", blockEvent, true);
        document.removeEventListener("touchstart", blockEvent, true);
        window.location.reload();
      };
    }
    if (minOverlap === overlapTop) {
      newTop = zombieRectAdjusted.top - player.offsetHeight + 40;
      player.velocityY = 0;
      player.isJumping = false;
      collisionTop = true;
      isPlayerAlive = false;
      console.log("You died top");
      player.style.backgroundImage = 'url("assets/dead.png")';
      showGameOverPopup();
      return; // Stop further updates
    } else if (minOverlap === overlapBottom) {
      newTop = zombieRectAdjusted.bottom;
      player.velocityY = 0;
      collisionBottom = true;
      isPlayerAlive = false;

      console.log("You died bottom");
      player.style.backgroundImage = 'url("assets/dead.png")';
      showGameOverPopup();
      return;
    } else if (minOverlap === overlapLeft) {
      newLeft = zombieRectAdjusted.left - player.offsetWidth;
      collisionLeft = true;
      isPlayerAlive = false;

      console.log("You died left");
      player.style.backgroundImage = 'url("assets/dead.png")';
      showGameOverPopup();
      return;
    } else if (minOverlap - 100 === overlapRight) {
      newLeft = zombieRectAdjusted.right - 120;
      collisionRight = true;
      isPlayerAlive = false;

      console.log("You died right");
      player.style.backgroundImage = 'url("assets/dead.png")';
      showGameOverPopup();
      return;
    }
  }

  // Ground collision if no cobblestone or zombie collision
  if (!collisionTop && newTop >= ground) {
    newTop = ground;
    player.velocityY = 0;
    player.isJumping = false;
    player.style.width = "200px";
  }

  // Update visuals when falling
  if (player.velocityY > 0 && player.isJumping && !collisionTop) {
    if (isPlayerAlive === false) {
      player.style.backgroundImage = 'url("assets/dead.png")';
      return;
    } else {
      player.style.backgroundImage = 'url("assets/jumpDown.png")';
      player.style.width = "215px";
      setTimeout(() => {
        if (isPlayerAlive) {
          player.style.backgroundImage = 'url("assets/idle.png")';
          player.style.width = "200px";
        }
      }, 300);
    }
  }
  // Apply final positions (with additional boundary checks)
  newLeft = Math.max(
    0,
    Math.min(newLeft, body.offsetWidth - player.offsetWidth)
  );
  newTop = Math.min(newTop, ground);

  player.style.top = newTop + "px";
  player.style.left = newLeft + "px";

  // Show "You Won" popup if player reaches gold
  const goldRect = gold.getBoundingClientRect();
  const goldTop = goldRect.top - body.getBoundingClientRect().top;
  const goldLeft = goldRect.left - body.getBoundingClientRect().left;
  const goldRectAdjusted = {
    top: goldTop,
    left: goldLeft,
    right: goldLeft + goldRect.width,
    bottom: goldTop + goldRect.height,
  };

  if (
    playerRect.right > goldRectAdjusted.left &&
    playerRect.left < goldRectAdjusted.right &&
    playerRect.bottom > goldRectAdjusted.top &&
    playerRect.top < goldRectAdjusted.bottom
  ) {
    player.style.backgroundImage = 'url("assets/won.png")';
    player.style.width = "250px";
    showYouWonPopup();
    return;
  }

  requestAnimationFrame(updatePlayer);
}

// "You Won" popup function
function showYouWonPopup() {
  if (document.getElementById("youWonPopup")) return;
  const popup = document.createElement("div");
  popup.id = "youWonPopup";
  popup.style.position = "fixed";
  popup.style.top = "50%";
  popup.style.left = "50%";
  popup.style.transform = "translate(-50%, -50%)";
  popup.style.background = "rgba(60, 179, 113, 0.95)";
  popup.style.borderRadius = "10%";
  popup.style.padding = "30px 50px";
  popup.style.zIndex = "9999";
  popup.style.fontSize = "2rem";
  popup.style.textAlign = "center";
  popup.innerHTML = `
    <div>You won!<br><br>
    <button id="playAgainBtn" style="font-size:1.2rem;font-weight:599;padding:10px 30px;margin-top:20px;">Play Again</button>
    </div>
  `;
  // Add a transparent overlay to block all interactions
  const overlay = document.createElement("div");
  overlay.id = "youWonOverlay";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.background = "rgba(0,0,0,0.2)";
  overlay.style.zIndex = "9998";
  overlay.style.pointerEvents = "auto";
  document.body.appendChild(overlay);
  document.body.appendChild(popup);

  function blockEvent(e) {
    if (!popup.contains(e.target)) {
      e.stopPropagation();
      e.preventDefault();
    }
  }
  document.addEventListener("keydown", blockEvent, true);
  document.addEventListener("keyup", blockEvent, true);
  document.addEventListener("mousedown", blockEvent, true);
  document.addEventListener("touchstart", blockEvent, true);

  document.getElementById("playAgainBtn").onclick = () => {
    popup.remove();
    overlay.remove();
    document.removeEventListener("keydown", blockEvent, true);
    document.removeEventListener("keyup", blockEvent, true);
    document.removeEventListener("mousedown", blockEvent, true);
    document.removeEventListener("touchstart", blockEvent, true);
    window.location.reload();
  };
}

// Start the game loop
requestAnimationFrame(updatePlayer);
