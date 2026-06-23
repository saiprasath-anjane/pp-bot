(function () {
  const currentScript = document.currentScript;
  const scriptUrl = new URL(currentScript.src);
  const DOC_BOT_URL = scriptUrl.origin;

  const button = document.createElement('button');
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #1E4597;
    color: white;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 999999;
    padding: 0;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  const img = document.createElement('img');
  img.src = `${DOC_BOT_URL}/pp-logo.png`;
  img.style.cssText = `width: 32px; height: 32px; object-fit: contain;`;
  button.appendChild(img);

  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    bottom: 90px;
    right: 20px;
    width: 380px;
    height: 560px;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 8px 30px rgba(0,0,0,0.2);
    display: none;
    z-index: 999999;
  `;

  const iframe = document.createElement('iframe');
  iframe.src = `${DOC_BOT_URL}/chat`;
  iframe.style.cssText = `width: 100%; height: 100%; border: none;`;
  container.appendChild(iframe);

  let open = false;
  button.addEventListener('click', () => {
    open = !open;
    container.style.display = open ? 'block' : 'none';
    button.innerHTML = open ? '<span style="font-size:20px">✕</span>' : '';
    if (!open) button.appendChild(img);
  });

  document.body.appendChild(button);
  document.body.appendChild(container);
})();
