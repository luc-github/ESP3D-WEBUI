/*
 processor.js - ESP3D WebUI Target file

 Copyright (c) 2020 Luc Lebosse. All rights reserved.

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

//only one query at once
const onGoingQuery = {
  source: "",
  command: "",
  started: false,
  content: [],
  feedback: null,
  startTime: 0,
};

//set parameter for starting a catch in stream
const startCatchResponse = (source, command, feedbackfn, arg) => {
  onGoingQuery.source = source;
  onGoingQuery.command = command;
  onGoingQuery.arg = arg;
  onGoingQuery.startTime = window.performance.now();
  onGoingQuery.started = false;
  onGoingQuery.ended = false;
  onGoingQuery.content = [];
  onGoingQuery.feedback = feedbackfn;
};

//stop the catch in stream
const stopCatchResponse = () => {
  onGoingQuery.source = "";
};

//steps
const responseSteps = {
  SD: {
    list: {
      start: (data) => data.startsWith("Begin file list"),
      end: (data) => data.startsWith("End file list"),
      error: (data) => {
        return data.indexOf("error") != -1;
      },
    },
    delete: {
      start: (data) => data.startsWith("File deleted"),
      end: (data) => data.startsWith("ok"),
      error: (data) => {
        return data.startsWith("Deletion failed");
      },
    },
  },
};
const processStream = (type, data) => {
  if (
    onGoingQuery.source != "" &&
    onGoingQuery.command != "" &&
    type == "stream"
  ) {
    const step = responseSteps[onGoingQuery.source][onGoingQuery.command];
    if (!onGoingQuery.started) {
      //allow 30s for start answer
      if (window.performance.now() - onGoingQuery.startTime > 30000) {
        stopCatchResponse();
        onGoingQuery.feedback({
          status: "error",
          command: onGoingQuery.command,
          arg: onGoingQuery.arg,
          content: "timeout",
        });
        return;
      }
      if (step.error(data)) {
        stopCatchResponse();
        if (onGoingQuery.feedback)
          onGoingQuery.feedback({
            status: "error",
            command: onGoingQuery.command,
            arg: onGoingQuery.arg,
            content: data,
          });
        return;
      }
      if (step.start(data)) {
        onGoingQuery.started = true;
        onGoingQuery.startTime = window.performance.now();
      }
    } else {
      if (step.end(data)) {
        stopCatchResponse();
        onGoingQuery.feedback({
          status: "ok",
          command: onGoingQuery.command,
          arg: onGoingQuery.arg,
          content: [...onGoingQuery.content],
        });
      } else {
        //4 min Timeout if answer started but no end
        if (window.performance.now() - onGoingQuery.startTime > 4 * 60000) {
          stopCatchResponse();
          onGoingQuery.feedback({
            status: "error",
            command: onGoingQuery.command,
            arg: onGoingQuery.arg,
            content: "timeout",
          });
        } else {
          onGoingQuery.content.push(data);
        }
      }
    }
  }
};

const processor = {
  startCatchResponse,
  handle: processStream,
};

export { processor };
