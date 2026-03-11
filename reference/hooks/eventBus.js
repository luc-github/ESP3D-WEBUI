/*
 eventBus.js - ESP3D WebUI hooks file

 Copyright (c) 2024 Luc LEBOSSE. All rights reserved.

 
 This code is free software; you can redistribute it and/or
 modify it under the terms of the GNU Lesser General Public
 License as published by the Free Software Foundation; either
 version 2.1 of the License, or (at your option) any later version.
 This code is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 Lesser General Public License for more details.
 You should have received a copy of the GNU Lesser General Public
 License along with This code; if not, write to the Free Software
 Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

/*
 * Basic EventBus to share data between components without using context
 *
 */

class EventBus {
  //Constructor init listeners list
  constructor() {
      this.listeners = {};
      this.listenerId = 0;
  }
// Listener
on(event, callback, id = null) {
  if (!this.listeners[event]) {
      this.listeners[event] = [];
  }

  const listenerId = id !== null ? id : this.listenerId++;

  // check if listener with this ID already exists
  const existingListenerIndex = this.listeners[event].findIndex(listener => listener.id === listenerId);
  if (existingListenerIndex !== -1) {
      //console.warn(`Listener with ID ${listenerId} for event ${event} already exists. Replacing.`);
      // Replace existing listener
      this.listeners[event][existingListenerIndex] = { id: listenerId, callback };
  } else {
      // Add new listener
      this.listeners[event].push({ id: listenerId, callback });
  }

  //console.log(`Listener ${existingListenerIndex !== -1 ? 'updated' : 'added'} for event: ${event}, ID: ${listenerId}, Total listeners: ${this.listeners[event].length}`);
  return listenerId;
}

// Remove listener from memory
  off(event, id) {
      if (!this.listeners[event]) return;
      this.listeners[event] = this.listeners[event].filter(listener => listener.id !== id);
  }
// Emitter
emit(event, data) {
  //console.log(`Emitting event: ${event}`, data);
  ////console.log(`Current listeners for ${event}:`, this.listeners[event]);
  if (!this.listeners[event]) return;
  this.listeners[event].forEach(listener => {
      ////console.log(`Calling listener with ID: ${listener.id}`);
      listener.callback(data);
  });
}
// List active listeners for debugging
  list() {
      //console.log("Active listeners:");
      for (const event in this.listeners) {
          this.listeners[event].forEach(listener => {
              //console.log(`Event: ${event}, ID: ${listener.id}`);
          });
      }
  }
}

export const eventBus = new EventBus();