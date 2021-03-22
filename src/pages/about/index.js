/*
 about.js - ESP3D WebUI navigation page file

 Copyright (c) 2020 Luc Lebosse. All rights reserved.
 Original code inspiration : 2021 Alexandre Aussourd
 
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
import { useEffect, useState } from "preact/hooks";
import { Loading, Panel } from "../../components/Spectre";
import { useHttpQueue } from "../../hooks";
import { espHttpURL } from "../../components/Helpers";
import { T } from "../../components/Translations";

/*
 * Local const
 *
 */
const About = () => {
  const { createNewRequest } = useHttpQueue();
  const [isLoading, setIsLoading] = useState(true);
  const [props, setProps] = useState([]);
  const getProps = () => {
    setIsLoading(true);
    createNewRequest(
      espHttpURL("command", { cmd: "[ESP420]" }).toString(),
      { method: "GET" },
      {
        onSuccess: (result) => {
          const { Status } = JSON.parse(result);
          console.log(Status);
          setProps([...Status]);
          setIsLoading(false);
        },
        onFail: (error) => {
          setIsLoading(false);
          //toasts.addToast({ content: error, type: 'error' })
        },
      }
    );
  };
  useEffect(() => {
    getProps();
  }, []);
  return (
    <div id="about" class="container">
      <h2>About</h2>
      {isLoading && <Loading />}
      <Panel>
        <Panel.Body>
          {!isLoading && props && (
            <ul>
              {props.map(({ id, value }) => (
                <li>
                  <span class="text-primary">{T(id)} </span> :{" "}
                  <span class="text-dark">{value}</span>
                </li>
              ))}
            </ul>
          )}
          <button
            className="btn"
            onClick={() => {
              getProps();
            }}
          >
            Refresh
          </button>
        </Panel.Body>
        <Panel.Footer></Panel.Footer>
      </Panel>
    </div>
  );
};

export default About;
