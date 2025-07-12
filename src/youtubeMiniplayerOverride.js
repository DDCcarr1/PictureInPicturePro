// Override YouTube miniplayer button to trigger extension PiP

function findMiniplayerButton() {
  // YouTube miniplayer button selector (as of July 2025)
  return document.querySelector('button.ytp-miniplayer-button');
}

function overrideMiniplayerButton() {
  const btn = findMiniplayerButton();
  if (!btn) return;

  // Avoid double-binding
  if (btn.hasAttribute('data-pip-override')) return;
  btn.setAttribute('data-pip-override', 'true');

  btn.addEventListener('click', async (e) => {
    e.stopImmediatePropagation();
    e.preventDefault();

    // Use the same logic as your extension's PiP
    const video = Array.from(document.querySelectorAll('video'))
      .filter(v => v.readyState !== 0 && v.disablePictureInPicture === false)
      .sort((v1, v2) => {
        const r1 = v1.getClientRects()[0] || { width: 0, height: 0 };
        const r2 = v2.getClientRects()[0] || { width: 0, height: 0 };
        return (r2.width * r2.height) - (r1.width * r1.height);
      })[0];

    if (video) {
      // If already in PiP, exit; else enter PiP
      if (video.hasAttribute('__pip__')) {
        document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
        video.setAttribute('__pip__', true);
        video.addEventListener('leavepictureinpicture', () => {
          video.removeAttribute('__pip__');
        }, { once: true });
      }
    }
  }, true);
}

// Observe DOM changes in case the button is re-rendered
const observer = new MutationObserver(overrideMiniplayerButton);
observer.observe(document.body, { childList: true, subtree: true });

// Initial run
overrideMiniplayerButton();