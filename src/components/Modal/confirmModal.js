/*
 confirmationModal.js - ESP3D WebUI component file

 Copyright (c) 2021 Alexandre Aussourd. All rights reserved.
 
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
import { HelpCircle } from "preact-feather";

const showConfirmationModal = ({
  modals,
  title,
  content,
  button1,
  button2,
}) => {
  const id = "confirmation";
  const defaultCb1 = () => {
    modals.removeModal(modals.getModalIndex(id));
    if (button1 && button1.cb) button1.cb();
  };
  const defaultCb2 = () => {
    modals.removeModal(modals.getModalIndex(id));
    if (button2 && button2.cb) button2.cb();
  };
  modals.addModal({
    id: id,
    title: (
      <div
        class="text-primary feather-icon-container"
        style="line-height:24px!important"
      >
        <HelpCircle />
        <label>{title}</label>
      </div>
    ),
    content: content,
    footer: (
      <div>
        <button class="btn mx-2" onClick={defaultCb1}>
          {button1.text}
        </button>
        <button class="btn mx-2" onClick={defaultCb2}>
          {button2.text}
        </button>
      </div>
    ),
    //overlay: true,
    hideclose: true,
  });
};

export { showConfirmationModal };
