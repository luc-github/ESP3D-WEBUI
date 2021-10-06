/*
 importHelper.js - ESP3D WebUI Target file

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
import { Fragment, h } from "preact";

const realCommand = {
  reset: "\u0018",
  status_report: "?",
  cycle_start: "~",
  safety_door: "\u0084",
  jog_cancel: "\u0085",
  debug_report: "\u0086", // Only when DEBUG_REPORT_REALTIME enabled, sends debug report in '{}' braces.
  feed_ovr_reset: "\u0090", // Restores feed override value to 100%.
  feed_ovr_coarse_plus: "\u0091",
  feed_ovr_coarse_minus: "\u0092",
  feed_ovr_fine_plus: "\u0093",
  feed_ovr_fine_minus: "\u0094",
  rapid_ovr_reset: "\u0095", // Restores rapid override value to 100%.
  rapid_ovr_medium: "\u0096",
  rapid_ovr_low: "\u0097",
  rapid_ovr_extra_low: "\u0098", // *NOT SUPPORTED*
  spindle_ovr_reset: "\u0099", // Restores spindle override value to 100%.
  spindle_ovr_coarse_plus: "\u009A", // 154
  spindle_ovr_coarse_minus: "\u009B",
  spindle_ovr_fine_plus: "\u009C",
  spindle_ovr_fine_minus: "\u009D",
  spindle_ovr_stop: "\u009E",
  coolantFlood_ovr_toggle: "\u00A0",
  coolantMist_ovr_toggle: "\u00A1",
};

export { realCommand };
