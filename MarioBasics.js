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

  if (keysHeld["a"]) {
    const left = Math.max(
      0,
      Math.min(
        player.offsetLeft - 25,
        body.offsetWidth - player.offsetWidth - 10
      )
    );
    player.style.left = left + "px";
    player.style.backgroundImage = 'url("assets/runLeft.png")';
    player.style.backgroundSize = "cover";
    player.style.width = "200px";
  } else if (keysHeld["d"]) {
    const right = Math.max(
      0,
      Math.min(
        player.offsetLeft + 10,
        body.offsetWidth - player.offsetWidth + 10
      )
    );
    player.style.left = right + "px";
    player.style.backgroundImage = 'url("assets/runRight.png")';
    player.style.backgroundSize = "cover";
    player.style.width = "200px";
    player.style.width = 200 + "px";
  }
  // Jump initiation
  if (keysHeld["w"] && !player.isJumping) {
    player.velocityY = -30; // jump strength
    player.isJumping = true;
    player.style.backgroundImage = 'url("assets/jumpUp.png")';
    player.style.width = 210 + "px";
  }

  // Gravity
  player.velocityY += 1; // gravity strength

  // Apply vertical movement
  newTop = player.offsetTop + player.velocityY;
  const ground = body.offsetHeight / 4.7;

  if (newTop >= ground) {
    newTop = ground;
    player.velocityY = 0;
    player.isJumping = false;
    player.style.backgroundImage = 'url("assets/idle.png")';
    player.style.width = 200 + "px";
  } else if (player.velocityY > 0 && player.isJumping) {
    player.style.backgroundImage = 'url("assets/jumpDown.png")';
    player.style.width = 215 + "px";
  }

  player.style.top = newTop + "px";
  const playerRect = player.getBoundingClientRect();
  const cobbleRects = [
    cobblestone1.getBoundingClientRect(),
    cobblestone2.getBoundingClientRect(),
  ];

  for (const cobbleRect of cobbleRects) {
    // Check horizontal overlap
    const horizontalOverlap =
      playerRect.right > cobbleRect.left && playerRect.left < cobbleRect.right;
    // Check if player is falling onto the cobblestone from above
    const isFalling =
      player.velocityY > 0 &&
      playerRect.bottom <= cobbleRect.top + player.velocityY &&
      newTop + player.offsetHeight >=
        cobbleRect.top - body.getBoundingClientRect().top;

    if (horizontalOverlap && isFalling) {
      // Land on top of cobblestone
      newTop =
        cobbleRect.top - body.getBoundingClientRect().top - player.offsetHeight;
      player.velocityY = 0;
      player.isJumping = false;
      player.style.backgroundImage = 'url("assets/idle.png")';
      player.style.width = 200 + "px";
      player.style.top = newTop + "px";
      continue; // Skip further collision checks for this frame
    }

    // Prevent passing through cobblestone from the sides or bottom
    // Only allow passing through if jumping up
    const isHittingFromBelow =
      player.velocityY < 0 &&
      playerRect.top >= cobbleRect.bottom - player.velocityY &&
      newTop <= cobbleRect.bottom - body.getBoundingClientRect().top;

    if (horizontalOverlap && isHittingFromBelow) {
      // Stop upward movement
      newTop = cobbleRect.bottom - body.getBoundingClientRect().top;
      player.velocityY = 0;
      player.style.top = newTop + "px";
      continue;
    }
  }
  requestAnimationFrame(updatePlayer);
}

updatePlayer();
