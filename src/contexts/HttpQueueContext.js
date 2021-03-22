/*
 HttpQueueContext.js - ESP3D WebUI context file

 Copyright (c) 2021 Alexandre Aussourd. All rights reserved.
 Modified by Luc LEBOSSE 2021
 
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
import { h, createContext } from "preact";
import { useContext, useRef } from "preact/hooks";
import { httpAdapter } from "../adapters";

/*
 * Local const
 *
 */
const HttpQueueContext = createContext("HttpQueueContext");
const useHttpQueueContext = () => useContext(HttpQueueContext);

const HttpQueueContextProvider = ({ children }) => {
  const requestQueue = useRef([]); // Http queue for every components
  const isBusy = useRef(false);
  const currentRequest = useRef();
  //Add new rRequest to queue
  const addInQueue = (newRequest) => {
    requestQueue.current = [...requestQueue.current, newRequest];
    console.log("addInQueue", requestQueue);
    if (!isBusy.current) executeHttpCall();
  };
  //Remove finished request from queue
  const removeRequestDone = () => {
    requestQueue.current = [...requestQueue.current].slice(1);
    currentRequest.current = null;
    console.log("removeRequestDone", requestQueue);
  };
  //Remove finished request from queue
  const removeRequests = (requestIds) => {
    const updatedRequestQueue = [...requestQueue.current].filter(({ id }) => {
      return !requestIds.includes(id);
    });
    requestQueue.current = updatedRequestQueue;
  };
  //Get current active request in queue
  const getCurrentRequest = () => {
    return currentRequest.current;
  };
  //Process query in queue
  const executeHttpCall = async () => {
    if (!isBusy.current) isBusy.current = true;
    const {
      url,
      params,
      onSuccess,
      onFail,
      onProgress,
    } = requestQueue.current[0];
    try {
      console.log(requestQueue.current[0]);
      console.log(`requete en cours... ${requestQueue.current[0].id}`);
      currentRequest.current = httpAdapter(url, params, onProgress);
      const response = await currentRequest.current.response;

      onSuccess(response);
    } catch (e) {
      console.log("catch");
      console.log(e.message);
      if (onFail) onFail(e.message); //to-check
      // add toast notification
    } finally {
      removeRequestDone();
      if (requestQueue.current.length > 0) {
        console.log("next");
        executeHttpCall();
      } else {
        console.log("end");
        isBusy.current = false;
      }
    }
  };

  return (
    <HttpQueueContext.Provider
      value={{ addInQueue, removeRequests, getCurrentRequest }}
    >
      {children}
    </HttpQueueContext.Provider>
  );
};

export { HttpQueueContextProvider, useHttpQueueContext };
