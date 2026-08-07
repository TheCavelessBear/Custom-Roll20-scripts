# libTokenMarkers reference

Active source: `Scripts/libTokenMarkers.js`.  
Complexity: simple command script (library-only).  
Direct Roll20 commands: none. The script handles `ready` only; selection is not used.

For integration context only, `libTokenMarkers.getStatus`, `getStatuses`, and `getOrderedList` expose campaign token-marker lookup data to other scripts. They are JavaScript APIs, not macros.

Live verification: results depend on the campaign's configured token markers.
