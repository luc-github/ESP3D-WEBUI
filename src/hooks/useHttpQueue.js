/*
 useHttpQueue.js - ESP3D WebUI hooks file

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
import { h } from "preact";
import { useState, useEffect, useRef } from "preact/hooks";
import { useHttpQueueContext } from "../contexts";
import { generateUID } from "../components/Helpers";

/*
 * Local const
 *
 */
const useHttpQueue = () => {
  const {
    addInQueue,
    removeRequests,
    getCurrentRequest,
  } = useHttpQueueContext();

  const [data, setData] = useState();
  const [killOnUnmount, setKillOnUnmount] = useState(true);
  const _localRequests = useRef([]);

  useEffect(() => {
    return () => killOnUnmount && removeRequests(_localRequests.current);
  }, []);

  const createNewRequest = (url, params, callbacks = {}) => {
    const {
      onSuccess: onSuccessCb,
      onFail: onFailCb,
      onProgress: onProgressCb,
    } = callbacks;
    const id = generateUID();
    _localRequests.current = [..._localRequests.current, id];
    addInQueue({
      id,
      url,
      params,
      onSuccess: (result) => {
        setData(result);
        if (onSuccessCb) onSuccessCb(result); // Faire des trucs ici
      },
      onProgress: (e) => {
        onProgressCb(e);
      },
      onFail: onFailCb
        ? (error) => {
            onFailCb(error);
          }
        : null,
    });
  };

  const abortRequest = () => {
    const currentRequest = getCurrentRequest();
    if (currentRequest) {
      currentRequest.abort();
    } else {
      // Toaster no current request
    }
  };

  return {
    data,
    setData,
    createNewRequest,
    abortRequest,
    setKillOnUnmount,
  };
};

export { useHttpQueue };
