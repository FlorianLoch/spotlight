/**
 * Spotlight.js
 * Copyright 2019-2021 Nextapps GmbH
 * Author: Thomas Wilkerling
 * Licence: Apache-2.0
 * https://github.com/nextapps-de/spotlight
 * THIS FILE HAS BEEN ADJUSTED AFTER FORKING THE PROJECT
 */

import {
  addClass,
  removeClass,
  toggleClass,
  setStyle,
  prepareStyle,
  restoreStyle,
  getByClass,
  setText,
  addListener,
  toggleListener,
  cancelEvent,
  createElement,
  toggleDisplay,
  toggleAnimation,
  toggleVisibility,
  downloadImage
} from "./helper.js";

// Have vite embed the CSS directly into the JS bundle
import "../css/spotlight.scss";

import { controls, controls_default, keycodes } from "./config.js";
import widget from "./template.js";
import { parse_src } from "./parser.js";

const controls_dom = {};
const connection = navigator["connection"];
const dpr = window["devicePixelRatio"] || 1;
const DATA_PREFIX = "spotlightjs";

/** @type {number} */
let x;
/** @type {number} */
let y;
/** @type {number} */
let startX;
/** @type {number} */
let startY;
/** @type {number} */
let viewport_w;
/** @type {number} */
let viewport_h;
/** @type {number} */
let media_w;
/** @type {number} */
let media_h;
/** @type {number} */
let scale;
/** @type {TouchList|undefined} */
let prev_touches;

/** @type {boolean} */
let is_down;
/** @type {boolean} */
let dragged;
/** @type {boolean} */
let slidable;
/** @type {boolean} */
let is_sliding_up;
/** @type {boolean} */
let toggle_autofit;
/** @type {string} */
let toggle_theme;

let current_slide;
let slide_count;
let anchors;
let options;
let options_media;
let options_group;
let options_infinite;
let options_progress;
let options_onshow;
let options_onchange;
let options_onclose;
let options_fit;
let options_autohide;
let options_autoslide;
let options_theme;
let options_preload;
let options_href;
let options_click;
let options_class;
let options_close_after_last;
let delay;

let animation_scale;
let animation_fade;
let animation_slide;
let animation_custom;

/** @type {HTMLBodyElement} */
let body;
/** @type {HTMLDivElement?} */
let panel;
/** @type {Array<HTMLDivElement>} */
let panes;
/** @type {Image|HTMLVideoElement|HTMLElement} */
let media;
let media_next = /** @type {HTMLImageElement} */ (createElement("img"));
/** @type {HTMLDivElement} */
let slider;
/** @type {HTMLDivElement} */
let header;
/** @type {HTMLDivElement} */
let footer;
/** @type {boolean} */
let footer_visible = false;
/** @type {HTMLDivElement} */
let title;
/** @type {HTMLDivElement} */
let description;
/** @type {HTMLDivElement} */
let button;
/** @type {HTMLDivElement} */
let page_prev;
/** @type {HTMLDivElement} */
let page_next;
/** @type {HTMLDivElement?} */
let maximize;
/** @type {HTMLDivElement} */
let page;
/** @type {HTMLDivElement} */
let player;
/** @type {HTMLDivElement} */
let progress;
/** @type {HTMLDivElement} */
let spinner;

let gallery;
let gallery_next;
let playing;
let hide;
let hide_cooldown;

let prefix_request, prefix_exit;

addListener(document, "click", dispatch);

export function init() {
  if (body) {
    return;
  }

  //console.log("init");

  body = document.body;
  slider = getOneByClass("scene");
  header = getOneByClass("header");
  footer = getOneByClass("footer");
  title = getOneByClass("title");
  description = getOneByClass("description");
  button = getOneByClass("button");
  page_prev = getOneByClass("prev");
  page_next = getOneByClass("next");
  page = getOneByClass("page");
  progress = getOneByClass("progress");
  spinner = getOneByClass("spinner");
  panes = [getOneByClass("pane")];

  addControl("close", close);

  body[(prefix_request = "requestFullscreen")] ||
    body[(prefix_request = "msRequestFullscreen")] ||
    body[(prefix_request = "webkitRequestFullscreen")] ||
    body[(prefix_request = "mozRequestFullscreen")] ||
    (prefix_request = "");

  if (prefix_request) {
    prefix_exit = prefix_request
      .replace("request", "exit")
      .replace("mozRequest", "mozCancel")
      .replace("Request", "Exit");

    maximize = addControl("fullscreen", fullscreen);
  } else {
    controls.pop(); // => "fullscreen"
  }

  addControl("info", info);
  addControl("autofit", autofit);
  addControl("zoom-in", zoom_in);
  addControl("zoom-out", zoom_out);
  addControl("theme", theme);
  player = addControl("play", play);
  addControl("download", download);

  addListener(page_prev, "click", prev);
  addListener(page_next, "click", next);

  /*
   * binding the tracking listeners to the "widget" will prevent all click listeners to be fired
   * binding the tracking listeners to the "spl-scene" breaks on iOS (seems to be a bug in their visual/touchable overflow calculation)
   * binding the tracking listeners to a wrapper "track" will fix both
   * the spinner element could not be used, it is below the widget to allow user actions (pointers)
   */

  const track = getOneByClass("track");

  addListener(track, "mousedown", start);
  addListener(track, "mousemove", move);
  addListener(track, "mouseleave", end);
  addListener(track, "mouseup", end);

  addListener(track, "touchstart", start, { passive: false });
  addListener(track, "touchmove", move, { passive: true });
  //addListener(track, "touchcancel", end);
  addListener(track, "touchend", end);
  // click listener for the wrapper "track" is already covered
  //addListener(track, "click", menu);

  addListener(button, "click", function () {
    if (options_click) {
      options_click(current_slide, options);
    } else if (options_href) {
      location.href = options_href;
    }
  });

  /**
   * @param {string} classname
   * @returns {HTMLDivElement}
   */

  function getOneByClass(classname) {
    //console.log("getOneByClass", classname);

    return (controls_dom[classname] = /** @type {HTMLDivElement} */ (
      getByClass("spl-" + classname, widget)[0]
    ));
  }
}

/**
 * @param {string} classname
 * @param {Function} fn
 * @returns {HTMLDivElement}
 */

export function addControl(classname, fn) {
  //console.log("addControl", classname, fn);

  const div = /** @type {HTMLDivElement} */ (createElement("div"));

  div.className = "spl-" + classname;
  addListener(div, "click", fn);
  header.appendChild(div);

  return (controls_dom[classname] = div);
}

/**
 * @param {string} classname
 */

export function removeControl(classname) {
  //console.log("dispatch", classname);

  const div = controls_dom[classname];

  if (div) {
    header.removeChild(div);
    controls_dom[classname] = null;
  }
}

/**
 * @param {Event} event
 */

function dispatch(event) {
  //console.log("dispatch");

  if (is_sliding_up) {
    return;
  }

  const target = /** @type {HTMLDivElement?} */ (
    event.target.closest(".spotlight")
  );

  if (target) {
    cancelEvent(event, true);

    const group = target.closest(".spotlight-group");

    anchors = getByClass("spotlight", group);

    // determine current selected index

    for (let i = 0; i < anchors.length; i++) {
      if (anchors[i] === target) {
        options_group =
          group && Object.assign({}, group.dataset, get_prefixed_data(group));
        init_gallery(i + 1);
        break;
      }
    }
  }
}

/**
 * @param {!HTMLCollection|Array} gallery
 * @param {Object=} group
 * @param {number=} index
 */

export function show(gallery, group, index) {
  //console.log("show", gallery, config);

  anchors = gallery;

  if (group) {
    options_group = group;
    options_onshow = group["onshow"];
    options_onchange = group["onchange"];
    options_onclose = group["onclose"];
    index = index || group["index"];
  }

  init_gallery(index);
}

/**
 * @param {number} index
 */

function init_gallery(index) {
  //console.log("init_gallery", index);

  slide_count = anchors.length;

  if (slide_count) {
    body || init();
    options_onshow && options_onshow(index);

    const pane = panes[0];
    const parent = pane.parentNode;

    for (let i = panes.length; i < slide_count; i++) {
      const clone = pane.cloneNode(false);

      setStyle(clone, "left", i * 100 + "%");
      parent.appendChild(clone);
      panes[i] = clone;
    }

    if (!panel) {
      body.appendChild(widget);
      update_widget_viewport();
      //resize_listener();
    }

    current_slide = index || 1;
    toggleAnimation(slider);
    setup_page(true);
    prefix_request && detect_fullscreen();
    show_gallery();
  }
}

/**
 * @param {string} key
 * @param {boolean|string|number=} defaultValue
 */

function parse_option(key, defaultValue) {
  const val = options[key];

  if (val !== undefined) {
    const sval = String(val);

    return sval !== "false" && (sval || defaultValue);
  }

  return defaultValue;
}

function get_prefixed_data(anchor) {
  const prefixedData = {};

  for (const key in anchor.dataset) {
    if (key.startsWith(DATA_PREFIX)) {
      let trimmedKey = key.substring(DATA_PREFIX.length);
      if (trimmedKey.length === 0) {
        continue;
      }

      // Revert the uppercasing performed by JS engines:
      // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset#in_javascript
      trimmedKey = trimmedKey[0].toLowerCase() + trimmedKey.substring(1);

      prefixedData[trimmedKey] = anchor.dataset[key];
    }
  }

  return prefixedData;
}

/**
 * @param {Object} anchor
 */

function apply_options(anchor) {
  options = Object.assign(
    {},
    options_group,
    anchor.dataset || anchor,
    get_prefixed_data(anchor)
  );

  // TODO: theme is icon and option field!

  options_media = options["media"];
  options_click = options["onclick"];
  options_theme = options["theme"];
  options_class = options["class"];
  options_autohide = parse_option("autohide", true);
  options_infinite = parse_option("infinite");
  options_progress = parse_option("progress", true);
  options_autoslide = parse_option("autoslide");
  options_preload = parse_option("preload", true);
  options_href = options["buttonHref"];
  delay = (options_autoslide && parseFloat(options_autoslide)) || 7;
  toggle_theme || (options_theme && theme(options_theme));
  options_class && addClass(widget, options_class);
  options_class && prepareStyle(widget);
  options_close_after_last = parse_option("closeAfterLast", false);

  const control = options["control"];

  // determine controls

  if (control) {
    const whitelist =
      typeof control === "string" ? control.split(",") : control;

    // prepare to false when using whitelist

    for (let i = 0; i < controls.length; i++) {
      options[controls[i]] = false;
    }

    // apply whitelist

    for (let i = 0; i < whitelist.length; i++) {
      const option = whitelist[i].trim();

      // handle shorthand "zoom"

      if (option === "zoom") {
        options["zoom-in"] = options["zoom-out"] = true;
      } else {
        options[option] = true;
      }
    }
  }

  // determine animations

  const animation = options["animation"];

  animation_scale = animation_fade = animation_slide = !animation;
  animation_custom = false;

  if (animation) {
    const whitelist =
      typeof animation === "string" ? animation.split(",") : animation;

    // apply whitelist

    for (let i = 0; i < whitelist.length; i++) {
      const option = whitelist[i].trim();

      if (option === "scale") {
        animation_scale = true;
      } else if (option === "fade") {
        animation_fade = true;
      } else if (option === "slide") {
        animation_slide = true;
      } else if (option) {
        animation_custom = option;
      }
    }
  }

  options_fit = options["fit"];
}

/**
 * @param {boolean=} prepare
 */

function prepare_animation(prepare) {
  //console.log("prepare_animation", prepare);

  if (prepare) {
    prepareStyle(media, prepare_animation);
  } else {
    toggleAnimation(slider, animation_slide);
    setStyle(media, "opacity", animation_fade ? 0 : 1);
    update_scroll(animation_scale && 0.8);
    animation_custom && addClass(media, animation_custom);
  }
}

/**
 * @param {number} index
 */

function init_slide(index) {
  //console.log("init_slide", index);

  panel = panes[index - 1];
  media = /** @type {Image|HTMLVideoElement|HTMLElement} */ (panel.firstChild);
  current_slide = index;

  if (media) {
    disable_autoresizer();

    if (options_fit) {
      addClass(media, options_fit);
    }

    prepare_animation(true);

    animation_custom && removeClass(media, animation_custom);
    animation_fade && setStyle(media, "opacity", 1);
    animation_scale && setStyle(media, "transform", "");
    setStyle(media, "visibility", "visible");

    gallery_next && (media_next.src = gallery_next);
    options_autoslide && animate_bar(playing);
  } else {
    const type = gallery.media;
    const options_spinner = parse_option("spinner", true);

    if (type === "video") {
      toggle_spinner(options_spinner, true);
      media = /** @type {HTMLVideoElement} */ (createElement("video"));

      media.onloadedmetadata = function () {
        if (media === this) {
          media.onerror = null;
          media.width = media.videoWidth;
          media.height = media.videoHeight;
          update_media_viewport();
          toggle_spinner(options_spinner);
          init_slide(index);
        }
      };

      media.poster = options["poster"];
      media.preload = options_preload ? "auto" : "metadata";
      media.controls = parse_option("controls", true);
      media.autoplay = options["autoplay"];
      media.playsinline = parse_option("inline");
      media.muted = parse_option("muted");
      media.src = gallery.src; //files[i].src;

      // const source = createElement("source");
      // source.type = "video/" + files[i].type;
      // source.src = files[i].src;
      // media.appendChild(source);

      panel.appendChild(media);
    } else if (type === "node") {
      media = gallery.src;

      if (typeof media === "string") {
        media = /** @type {HTMLElement} */ (document.querySelector(media));
      }

      if (media) {
        media._root || (media._root = media.parentNode);
        media._style || (media._style = media.getAttribute("style"));
        restoreStyle(media);
        update_media_viewport();

        panel.appendChild(media);
        init_slide(index);
      }

      return;
    } else {
      toggle_spinner(options_spinner, true);
      media = /** @type {HTMLVideoElement|Image} */ (createElement("img"));

      media.onload = function () {
        if (media === this) {
          media.onerror = null;
          toggle_spinner(options_spinner);
          init_slide(index);
          update_media_viewport();
        }
      };

      //media.crossOrigin = "anonymous";
      media.src = gallery.src;
      panel.appendChild(media);
    }

    if (media) {
      options_spinner || setStyle(media, "visibility", "visible");

      media.onerror = function () {
        if (media === this) {
          checkout(media);
          addClass(spinner, "error");
          toggle_spinner(options_spinner);
        }
      };
    }
  }
}

/**
 *
 * @param {boolean=} options_spinner
 * @param {boolean=} is_on
 */

function toggle_spinner(options_spinner, is_on) {
  //console.log("toggle_spinner", options_spinner, is_on);

  options_spinner && toggleClass(spinner, "spin", is_on);
}

/**
 * @returns {boolean}
 */

function has_fullscreen() {
  //console.log("has_fullscreen");

  return (
    document["fullscreen"] ||
    document["fullscreenElement"] ||
    document["webkitFullscreenElement"] ||
    document["mozFullScreenElement"]
  );
}

function resize_listener() {
  //console.log("resize_listener");

  update_widget_viewport();
  media && update_media_viewport();

  if (prefix_request) {
    const is_fullscreen = has_fullscreen();

    toggleClass(maximize, "on", is_fullscreen);

    // handle when user toggles the fullscreen state manually
    // entering the fullscreen state manually needs to be hide the fullscreen icon, because
    // the exit fullscreen handler will not work due to a browser restriction

    is_fullscreen || detect_fullscreen();
  }

  //update_scroll();
}

function detect_fullscreen() {
  toggleDisplay(maximize, screen.availHeight - window.innerHeight > 0);
}

function update_widget_viewport() {
  //console.log("update_widget_viewport");

  viewport_w = widget.clientWidth;
  viewport_h = widget.clientHeight;
}

function update_media_viewport() {
  //console.log("update_media_viewport");

  media_w = media.clientWidth;
  media_h = media.clientHeight;
}

// function update_media_dimension(){
//
//     media_w = media.width;
//     media_h = media.height;
// }

/**
 * @param {number=} force_scale
 */

function update_scroll(force_scale) {
  //console.log("update_scroll", force_scale);

  setStyle(
    media,
    "transform",
    "translate(-50%, -50%) scale(" + (force_scale || scale) + ")"
  );
}

/**
 * @param {number=} x
 * @param {number=} y
 */

function update_panel(x, y) {
  //console.log("update_panel", x, y);

  setStyle(
    panel,
    "transform",
    x || y ? "translate(" + x + "px, " + y + "px)" : ""
  );
}

/**
 * @param {number} index
 * @param {boolean=} prepare
 * @param {number=} offset
 */

function update_slider(index, prepare, offset) {
  //console.log("update_slider", prepare, offset);

  if (prepare) {
    prepareStyle(slider, function () {
      update_slider(index, false, offset);
    });
  } else {
    setStyle(
      slider,
      "transform",
      "translateX(" + (-index * 100 + (offset || 0)) + "%)"
    );
  }
}

/**
 * @param {boolean=} install
 */

function toggle_listener(install) {
  //console.log("toggle_listener", install);

  toggleListener(install, window, "keydown", key_listener);
  toggleListener(install, window, "wheel", wheel_listener);
  toggleListener(install, window, "resize", resize_listener);
  toggleListener(install, window, "popstate", history_listener);
}

/**
 * @param {PopStateEvent} event
 */

function history_listener(event) {
  //console.log("history_listener");

  if (panel && /*event.state &&*/ event.state["spl"]) {
    close(true);
  }
}

/**
 * @param {KeyboardEvent} event
 */

function key_listener(event) {
  //console.log("key_listener");

  if (panel) {
    const zoom_enabled = options["zoom-in"] !== false;

    switch (event.keyCode) {
      case keycodes.BACKSPACE:
        zoom_enabled && autofit();
        break;

      case keycodes.ESCAPE:
        close();
        break;

      case keycodes.SPACEBAR:
        options_autoslide && play();
        break;

      case keycodes.LEFT:
        prev();
        break;

      case keycodes.RIGHT:
        next();
        break;

      case keycodes.UP:
      case keycodes.NUMBLOCK_PLUS:
      case keycodes.PLUS:
        zoom_enabled && zoom_in();
        break;

      case keycodes.DOWN:
      case keycodes.NUMBLOCK_MINUS:
      case keycodes.MINUS:
        zoom_enabled && zoom_out();
        break;

      case keycodes.INFO:
        info();
        break;
    }
  }
}

/**
 * @param {WheelEvent} event
 */

function wheel_listener(event) {
  //console.log("wheel_listener");

  if (panel && options["zoom-in"] !== false) {
    let delta = event["deltaY"];
    delta = (delta < 0 ? 1 : delta ? -1 : 0) * 0.5;

    if (delta < 0) {
      zoom_out(event, event.clientX, event.clientY);
    } else if (delta > 0) {
      zoom_in(event, event.clientX, event.clientY);
    }
  }
}

/**
 * @param {Event|boolean=} init
 * @param {boolean=} _skip_animation
 */

export function play(init, _skip_animation) {
  //console.log("play", init);

  const state = typeof init === "boolean" ? init : !playing;

  if (state === !playing) {
    playing = playing ? clearTimeout(playing) : 1;
    toggleClass(player, "on", playing);
    _skip_animation || animate_bar(playing);
  }
}

/**
 * @param {?=} start
 */

function animate_bar(start) {
  //console.log("animate_bar", start);

  if (options_progress) {
    prepareStyle(progress, function () {
      setStyle(progress, "transition-duration", "");
      setStyle(progress, "transform", "");
    });

    if (start) {
      setStyle(progress, "transition-duration", delay + "s");
      setStyle(progress, "transform", "translateX(0)");
    }
  }

  if (start) {
    playing = setTimeout(next, delay * 1000);
  }
}

function autohide() {
  //console.log("autohide");

  if (options_autohide) {
    hide_cooldown = Date.now() + 2950;

    if (!hide) {
      addClass(widget, "menu");
      schedule(3000);
    }
  }
}

/**
 * @param {number} cooldown
 */

function schedule(cooldown) {
  //console.log("schedule", cooldown);

  hide = setTimeout(function () {
    const now = Date.now();

    if (now >= hide_cooldown) {
      removeClass(widget, "menu");
      hide = 0;
    } else {
      schedule(hide_cooldown - now);
    }
  }, cooldown);
}

/**
 * @param {boolean=} state
 */

export function menu(state) {
  //console.log("menu");

  if (typeof state === "boolean") {
    hide = state ? hide : 0;
  }

  if (hide) {
    hide = clearTimeout(hide);
    removeClass(widget, "menu");
  } else {
    autohide();
  }
}

/**
 * @param {TouchEvent|MouseEvent} e
 */

function start(e) {
  //console.log("start");

  cancelEvent(e, true);

  is_down = true;
  dragged = false;
  is_sliding_up = false;

  /** @type {TouchEvent|MouseEvent|Touch}  */
  let touch = e;
  let touches = e.touches;
  prev_touches = touches;

  if (touches && (touches = touches[0])) {
    touch = touches;
  }

  slidable =
    /* !toggle_autofit && */ media_w * scale <= viewport_w &&
    media_h * scale <= viewport_h;
  startX = touch.pageX;
  startY = touch.pageY;

  toggleAnimation(panel);
}

/**
 * @param {TouchEvent|MouseEvent} e
 */

function end(e) {
  //console.log("end");

  cancelEvent(e);

  prev_touches = null;

  if (is_down) {
    if (!dragged) {
      menu();
    } else {
      if (slidable && dragged) {
        const has_next =
          x < -(viewport_w / 7) &&
          (current_slide < slide_count || options_infinite || options_close_after_last);
        const has_prev =
          has_next ||
          (x > viewport_w / 7 && (current_slide > 1 || options_infinite || options_close_after_last));

        if (has_next || has_prev) {
          update_slider(
            current_slide - 1,
            /* prepare? */ true,
            (x / viewport_w) * 100
          );

          (has_next && next()) || (has_prev  && prev());
        }

        if (is_sliding_up && y < -(viewport_h / 4)) {
          close();
        } else {
          x = 0;
          y = 0;
        }

        update_panel();
      }

      toggleAnimation(panel, true);
    }

    is_down = false;
  }
}

/**
 * @param {TouchList} touches
 * @returns {number}
 */

function distance(touches) {
  return Math.sqrt(
    Math.pow(touches[0].clientX - touches[1].clientX, 2) +
      Math.pow(touches[0].clientY - touches[1].clientY, 2)
  );
}

/**
 * @param {TouchList} touches
 */
function center_of(touches) {
  return [
    (touches[0].clientX + touches[1].clientX) * 0.5,
    (touches[0].clientY + touches[1].clientY) * 0.5
  ];
}

/**
 * @param {TouchList=} touches
 */

function scale_touches(touches) {
  if (
    options["zoom-in"] !== false &&
    touches &&
    touches.length === 2 &&
    prev_touches &&
    prev_touches.length === 2
  ) {
    const relative_scale = distance(touches) / distance(prev_touches);
    const center = center_of(touches);
    centered_zoom(relative_scale, center[0], center[1], false);
  }

  prev_touches = touches;
  return touches && touches[0];
}

/**
 * @param {TouchEvent|MouseEvent} e
 */

function move(e) {
  //console.log("move");

  cancelEvent(e);

  if (is_down) {
    let touches = scale_touches(e.touches);

    if (touches) {
      e = touches;
    }

    if (!dragged) {
      const dx = startX - e.pageX;
      const dy = startY - e.pageY;
      is_sliding_up = slidable && dy > Math.abs(dx) * 1.15;
    }

    if (is_sliding_up) {
      // handle y-axis in y-slide mode
      y -= startY - (startY = e.pageY);
    } else if (slidable) {
      // handle x-axis in x-slide mode
      x -= startX - (startX = e.pageX);
    } else {
      // handle x-axis in drag mode

      let sign = (media_w * scale - viewport_w) / 2;
      let diff = Math.abs(sign);
      if (sign > 0) {
        x -= startX - (startX = e.pageX);
      }
      if (x > diff) {
        x = diff;
      } else if (x < -diff) {
        x = -diff;
      }

      // handle y-axis in drag mode

      sign = (media_h * scale - viewport_h) / 2;
      diff = Math.abs(sign);
      if (sign > 0) {
        y -= startY - (startY = e.pageY);
      }
      if (y > diff) {
        y = diff;
      } else if (y < -diff) {
        y = -diff;
      }
    }

    dragged = true;

    update_panel(x, y);
  } else {
    autohide();
  }
}

/**
 * @param {Event|boolean=} init
 */

export function fullscreen(init) {
  //console.log("fullscreen", init);

  const is_fullscreen = has_fullscreen();

  if (typeof init !== "boolean" || init !== !!is_fullscreen) {
    if (is_fullscreen) {
      document[prefix_exit]();
      //removeClass(maximize, "on");
    } else {
      widget[prefix_request]();
      //addClass(maximize, "on");
    }
  }
}

/**
 * @param {Event|string=} theme
 */

export function theme(theme) {
  //console.log("theme", theme);

  if (typeof theme !== "string") {
    // toggle:

    theme = toggle_theme ? "" : options_theme || "white";
  }

  if (toggle_theme !== theme) {
    // set:

    toggle_theme && removeClass(widget, toggle_theme);
    theme && addClass(widget, theme);
    toggle_theme = theme;
  }
}

/**
 * @param {Event|boolean=} init
 */

export function autofit(init) {
  //console.log("autofit", init);

  if (typeof init === "boolean") {
    toggle_autofit = !init;
  }

  toggle_autofit = scale === 1 && !toggle_autofit;

  toggleClass(media, "autofit", toggle_autofit);
  setStyle(media, "transform", "");

  scale = 1;
  x = 0;
  y = 0;

  update_media_viewport();
  toggleAnimation(panel);
  update_panel();
  //autohide();
}

/**
 * @param {number} relative
 * @param {number=} cx
 * @param {number=} cy
 * @param {boolean=} animated
 */

function centered_zoom(relative, cx, cy, animated) {
  let value = scale * relative;

  toggleAnimation(panel, animated);
  toggleAnimation(media, animated);
  disable_autoresizer();

  if (value <= 1) {
    x = y = 0;
    update_panel(x, y);
    zoom(1);

    // if(options_fit){
    //
    //     addClass(media, options_fit);
    // }

    return;
  }

  if (value > 50) {
    // if(options_fit){
    //
    //     removeClass(media, options_fit);
    // }

    return;
  }

  if (cy) {
    const half_w = viewport_w / 2,
      half_h = viewport_h / 2;
    x = cx - (cx - x - half_w) * relative - half_w;
    y = cy - (cy - y - half_h) * relative - half_h;
  } else {
    x *= relative;
    y *= relative;
  }

  update_panel(x, y);
  zoom(value);
}

/**
 * @param {Event=} e
 * @param {number=} cx
 * @param {number=} cy
 */

function zoom_in(e, cx, cy) {
  //console.log("zoom_in");

  centered_zoom(1 / 0.65, cx, cy, true);
}

/**
 * @param {Event=} e
 * @param {number=} cx
 * @param {number=} cy
 */

function zoom_out(e, cx, cy) {
  //console.log("zoom_out");

  centered_zoom(0.65, cx, cy, true);
}

/**
 * @param {number=} factor
 */

export function zoom(factor) {
  //console.log("zoom", factor);

  scale = factor || 1;

  update_scroll();
}

export function info() {
  //console.log("info");

  footer_visible = !footer_visible;
  toggleVisibility(footer, footer_visible);
}

function disable_autoresizer() {
  //console.log("disable_autoresizer");

  //update_media_dimension();

  if (toggle_autofit) {
    // removeClass(media, "autofit");
    // toggle_autofit = false;

    autofit();
  }
}

function show_gallery() {
  //console.log("show_gallery");

  history.pushState({ spl: 1 }, "");
  history.pushState({ spl: 2 }, "");

  toggleAnimation(widget, true);
  addClass(body, "hide-scrollbars");
  addClass(widget, "show");

  toggle_listener(true);
  update_widget_viewport();
  //resize_listener();
  autohide();

  options_autoslide && play(true, true);
}

export function download() {
  //console.log("download", media);

  downloadImage(body, media);
}

/**
 * @param {boolean=} hashchange
 */

export function close(hashchange) {
  //console.log("close", hashchange);

  setTimeout(function () {
    body.removeChild(widget);
    panel =
      media =
      gallery =
      options =
      options_group =
      anchors =
      options_onshow =
      options_onchange =
      options_onclose =
      options_click =
        null;
    is_sliding_up = false;
  }, 200);

  removeClass(body, "hide-scrollbars");
  removeClass(widget, "show");

  fullscreen(false);
  toggle_listener();

  history.go(hashchange === true ? -1 : -2);

  // teardown

  gallery_next && (media_next.src = "");
  playing && play();
  media && checkout(media);
  hide && (hide = clearTimeout(hide));
  toggle_theme && theme();
  options_class && removeClass(widget, options_class);
  options_onclose && options_onclose();
}

/**
 * @param {Image|HTMLVideoElement|HTMLElement} media
 */

function checkout(media) {
  //console.log("checkout");

  if (media._root) {
    media.setAttribute("style", media._style || "");
    media._root.appendChild(media);
    media._root = media._style = null;
  } else {
    const parent = media.parentNode;
    parent && parent.removeChild(media);
    media.onerror = null;
    media.src = "";
  }
}

/**
 * @param {Event=} e
 */

export function prev(e) {
  //console.log("prev");

  e && autohide();

  if (slide_count > 1) {
    if (current_slide > 1) {
      return goto(current_slide - 1);
    } else if (options_infinite) {
      update_slider(slide_count, true);

      return goto(slide_count);
    } else if (options_close_after_last) {
      close();
    }
  }
}

/**
 * @param {Event=} e
 */

export function next(e) {
  //console.log("next");

  e && autohide();

  if (slide_count > 1) {
    if (current_slide < slide_count) {
      return goto(current_slide + 1);
    } else if (options_infinite) {
      update_slider(-1, true);

      return goto(1);
    } else if (playing) {
      play();
    } else if (options_close_after_last) {
      close();
    }
  }
}

/**
 * @param {number} slide
 * @returns {boolean|undefined}
 */

export function goto(slide) {
  //console.log("goto", slide);

  if (slide !== current_slide) {
    if (playing) {
      clearTimeout(playing);
      animate_bar();
    } else {
      autohide();
    }

    //playing ? animate_bar() : autohide();

    const direction = slide > current_slide;

    current_slide = slide;
    setup_page(direction);
    //options_autoslide && play(true, true);

    return true;
  }
}

/**
 * @param {boolean} direction
 */

function prepare(direction) {
  //console.log("prepare", direction);

  let anchor = anchors[current_slide - 1];

  apply_options(anchor);

  const speed = connection && connection["downlink"];
  let size = Math.max(viewport_h, viewport_w) * dpr;

  if (speed && speed * 1200 < size) {
    size = speed * 1200;
  }

  let tmp;

  gallery = {
    media: options_media,
    src: parse_src(anchor, size, options, options_media),
    title: parse_option(
      "title",
      anchor["alt"] ||
        anchor["title"] ||
        // inherit title from a direct child only
        ((tmp = anchor.firstElementChild) && (tmp["alt"] || tmp["title"]))
    )
  };

  gallery_next && (media_next.src = gallery_next = "");

  if (options_preload && direction) {
    if ((anchor = anchors[current_slide])) {
      const options_next = Object.assign(
        {},
        anchor.dataset || anchor,
        get_prefixed_data(anchor)
      );
      const next_media = options_next["media"];

      if (!next_media || next_media === "image") {
        gallery_next = parse_src(anchor, size, options_next, next_media);
      }
    }
  }

  // apply controls

  for (let i = 0; i < controls.length; i++) {
    const option = controls[i];

    //console.log(option + ": ", options[option]);

    toggleDisplay(
      controls_dom[option],
      parse_option(option, controls_default[option])
    );
  }
}

/**
 * @param {boolean} direction
 */

function setup_page(direction) {
  //console.log("setup_page", direction);

  x = 0;
  y = 0;
  scale = 1;

  if (media) {
    // Note: the onerror callback was removed when the image was fully loaded (also for video)

    if (media.onerror) {
      checkout(media);
    } else {
      let ref = media;

      setTimeout(function () {
        if (ref && media !== ref) {
          checkout(ref);
          ref = null;
        }
      }, 650);

      // animate out the old image

      prepare_animation();
      update_panel();
    }
  }

  footer && toggleVisibility(footer, false);

  prepare(direction);
  update_slider(current_slide - 1);
  removeClass(spinner, "error");
  init_slide(current_slide);
  toggleAnimation(panel);
  update_panel();

  const str_title = gallery.title;
  const str_description = parse_option("description");
  const str_button = parse_option("button");
  const has_content = str_title || str_description || str_button;

  if (has_content) {
    str_title && setText(title, str_title);
    str_description && setText(description, str_description);
    str_button && setText(button, str_button);

    toggleDisplay(title, str_title);
    toggleDisplay(description, str_description);
    toggleDisplay(button, str_button);

    setStyle(footer, "transform", options_autohide === "all" ? "" : "none");
  }

  options_autohide || addClass(widget, "menu");

  footer_visible = has_content;
  toggleVisibility(footer, footer_visible);
  toggleVisibility(page_prev, options_infinite || current_slide > 1);
  toggleVisibility(page_next, options_infinite || current_slide < slide_count);
  setText(page, slide_count > 1 ? current_slide + " / " + slide_count : "");

  options_onchange && options_onchange(current_slide, options);
}
