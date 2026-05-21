(function () {
  'use strict';

  console.log('[VisualEdit] Overlay active');

  // Highlight hovered elements for visual editing
  var highlighted = null;

  document.addEventListener('mouseover', function (e) {
    if (highlighted) highlighted.style.outline = '';
    highlighted = e.target;
    e.target.style.outline = '2px dashed #6366f1';
    e.target.style.outlineOffset = '2px';
  });

  document.addEventListener('mouseout', function (e) {
    e.target.style.outline = '';
    e.target.style.outlineOffset = '';
    highlighted = null;
  });

  // Listen for commands from a parent builder/editor
  window.addEventListener('message', function (event) {
    console.log('[VisualEdit] Message from parent:', event.data);
    // Handle edit commands from your builder tool here
  });

  // Notify parent that the overlay is ready
  if (window.parent) {
    window.parent.postMessage({ type: 'VISUAL_EDIT_READY' }, '*');
  }
})();
