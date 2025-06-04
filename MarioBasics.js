let player = document.getElementById("player");
let body = document.body;
let cobblestone1 = document.getElementById("cobblestone1");
let cobblestone2 = document.getElementById("cobblestone2");
let keysHeld = {};

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
    // Fixed: Properly constrain right movement
    newLeft = Math.min(
      body.offsetWidth - player.offsetWidth, // This is the maximum allowed left position
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
  const ground = body.offsetHeight / 3.83;

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

  // Reset collision flags
  let collisionTop = false;
  let collisionBottom = false;
  let collisionLeft = false;
  let collisionRight = false;

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

    // Check if player is colliding with cobblestone
    if (
      playerRect.right > cobbleRectAdjusted.left &&
      playerRect.left < cobbleRectAdjusted.right &&
      playerRect.bottom > cobbleRectAdjusted.top &&
      playerRect.top < cobbleRectAdjusted.bottom
    ) {
      // Calculate overlap amounts
      const overlapTop = playerRect.bottom - cobbleRectAdjusted.top;
      const overlapBottom = cobbleRectAdjusted.bottom - playerRect.top;
      const overlapLeft = playerRect.right - cobbleRectAdjusted.left;
      const overlapRight = cobbleRectAdjusted.right - playerRect.left;

      // Find the smallest overlap to determine collision side
      const minOverlap = Math.min(
        overlapTop,
        overlapBottom,
        overlapLeft,
        overlapRight
      );

      if (minOverlap === overlapTop) {
        // Collision from top (landing on cobblestone)
        newTop = cobbleRectAdjusted.top - player.offsetHeight;
        player.velocityY = 0;
        player.isJumping = false;
        collisionTop = true;
      } else if (minOverlap === overlapBottom) {
        // Collision from bottom (hitting head)
        newTop = cobbleRectAdjusted.bottom;
        player.velocityY = 0;
        collisionBottom = true;
      } else if (minOverlap === overlapLeft) {
        // Collision from left
        newLeft = cobbleRectAdjusted.left - player.offsetWidth;
        collisionLeft = true;
      } else if (minOverlap === overlapRight) {
        // Collision from right

        newLeft = cobbleRectAdjusted.right;
        collisionRight = true;
      }
    }
  }

  // Ground collision if no cobblestone collision
  if (!collisionTop && newTop >= ground) {
    newTop = ground;
    player.velocityY = 0;
    player.isJumping = false;
    player.style.width = "200px";
  }

  // Update visuals when falling
  if (player.velocityY > 0 && player.isJumping && !collisionTop) {
    player.style.backgroundImage = 'url("assets/jumpDown.png")';
    player.style.width = "215px";
    setTimeout(() => {
      player.style.backgroundImage = 'url("assets/idle.png")';
      player.style.width = "200px";
    }, 300);
  }

  // Apply final positions (with additional boundary checks)
  newLeft = Math.max(
    0,
    Math.min(newLeft, body.offsetWidth - player.offsetWidth)
  );
  newTop = Math.min(newTop, ground); // Prevent falling below ground

  player.style.top = newTop + "px";
  player.style.left = newLeft + "px";

  requestAnimationFrame(updatePlayer);
}

updatePlayer();
