var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/@create-figma-plugin/utilities/lib/ui.js
function showUI(options, data) {
  if (typeof __html__ === "undefined") {
    throw new Error("No UI defined");
  }
  const html = `<div id="create-figma-plugin"></div><script>document.body.classList.add('theme-${figma.editorType}');const __FIGMA_COMMAND__='${typeof figma.command === "undefined" ? "" : figma.command}';const __SHOW_UI_DATA__=${JSON.stringify(typeof data === "undefined" ? {} : data)};${__html__}</script>`;
  figma.showUI(html, __spreadProps(__spreadValues({}, options), {
    themeColors: typeof options.themeColors === "undefined" ? true : options.themeColors
  }));
}
var init_ui = __esm({
  "node_modules/@create-figma-plugin/utilities/lib/ui.js"() {
  }
});

// node_modules/@create-figma-plugin/utilities/lib/index.js
var init_lib = __esm({
  "node_modules/@create-figma-plugin/utilities/lib/index.js"() {
    init_ui();
  }
});

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => main_default
});
function main_default() {
  console.log("Plugin started");
  const options = { width: 240, height: 320 };
  showUI(options);
  function updateThemesFromSelection() {
    if (figma.currentPage.selection.length === 0) {
      figma.ui.postMessage({
        type: "SELECTION_EMPTY",
        message: "Please select at least one layer"
      });
      return;
    }
    const { themes: detectedThemes, instanceCount, circularInstances } = findAvailableThemes();
    console.log("Detected themes:", detectedThemes);
    console.log("Instance count:", instanceCount);
    console.log("Circular instances:", circularInstances);
    const standardThemes = ["Light", "Dark"];
    const themesToUse = Array.from(/* @__PURE__ */ new Set([...standardThemes, ...detectedThemes]));
    console.log("Themes to use:", themesToUse);
    figma.ui.postMessage({
      type: "THEMES_AVAILABLE",
      themes: themesToUse,
      instanceCount,
      selectionCount: figma.currentPage.selection.length,
      circularInstances
    });
  }
  figma.ui.onmessage = (msg) => {
    if (msg.type === "INIT" || msg.type === "SELECTION_CHANGED") {
      updateThemesFromSelection();
    } else if (msg.type === "SUBMIT") {
      console.log("Applying theme:", msg.formValues.theme);
      const theme = msg.formValues.theme;
      const result = applyThemeToSelection(theme);
      console.log("Updated instances count:", result.updatedCount);
      console.log("Circular instances in result:", result.circularInstances);
      console.log("Circular instances count:", result.circularInstances.length);
      figma.ui.postMessage({
        type: "THEME_APPLIED",
        updatedCount: result.updatedCount,
        skippedCount: result.skippedCount,
        circularInstances: result.circularInstances,
        theme
      });
    } else if (msg.type === "CLOSE") {
      figma.closePlugin();
    } else if (msg.type === "CANCEL") {
      figma.closePlugin();
    }
  };
  figma.on("selectionchange", () => {
    updateThemesFromSelection();
  });
  setTimeout(() => {
    updateThemesFromSelection();
  }, 300);
}
function hasCircularReference(instance) {
  var _a;
  if (!instance.mainComponent) return false;
  const mainComponentId = instance.mainComponent.id;
  const mainComponentSetId = (_a = instance.mainComponent.parent) == null ? void 0 : _a.id;
  let parent = instance.parent;
  while (parent) {
    if (parent.type === "COMPONENT" && parent.id === mainComponentId) {
      console.error("CIRCULAR REFERENCE DETECTED:", instance.name, "is inside its own main component:", instance.mainComponent.name);
      return true;
    }
    if (parent.type === "COMPONENT_SET" && parent.id === mainComponentSetId) {
      console.log("Ignoring instance from same component set:", instance.name);
      return false;
    }
    parent = parent.parent;
  }
  return false;
}
function findAvailableThemes() {
  const themes = /* @__PURE__ */ new Set();
  let instanceCount = 0;
  let themePropertyCount = 0;
  const circularInstances = [];
  function traverseNode(node) {
    if (node.type === "INSTANCE") {
      instanceCount++;
      console.log("Instance found:", node.name);
      if (node.mainComponent) {
        console.log("Main component:", node.mainComponent.name);
        if (hasCircularReference(node)) {
          console.error("Skipping theme detection for circular instance:", node.name);
          circularInstances.push({
            name: node.name,
            id: node.id
          });
          return;
        }
      }
      try {
        const componentProperties = node.componentProperties;
        if (componentProperties && "Theme" in componentProperties) {
          themePropertyCount++;
          const themeProperty = componentProperties["Theme"];
          if (themeProperty && themeProperty.type === "VARIANT") {
            if (themeProperty.value && typeof themeProperty.value === "string") {
              themes.add(themeProperty.value);
            }
            try {
              const mainComponent = node.mainComponent;
              if (mainComponent) {
                if (mainComponent.variantProperties) {
                  if ("Theme" in mainComponent.variantProperties) {
                    const themeValues = mainComponent.variantProperties["Theme"];
                    if (Array.isArray(themeValues)) {
                      themeValues.forEach((value) => {
                        themes.add(value);
                      });
                    }
                  }
                }
              }
            } catch (error) {
              console.error("Error accessing main component properties:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error processing instance:", error);
      }
    }
    if ("children" in node) {
      for (const child of node.children) {
        traverseNode(child);
      }
    }
  }
  figma.currentPage.selection.forEach((node) => traverseNode(node));
  console.log(`Found ${instanceCount} instances, ${themePropertyCount} with Theme property`);
  return {
    themes: Array.from(themes),
    instanceCount: themePropertyCount,
    circularInstances
  };
}
function applyThemeToSelection(theme) {
  let updatedCount = 0;
  let skippedCount = 0;
  const circularInstances = [];
  function traverseNode(node) {
    if (node.type === "INSTANCE") {
      console.log("Checking instance for update:", node.name);
      if (hasCircularReference(node)) {
        console.error("Skipping update for circular instance:", node.name);
        circularInstances.push({
          name: node.name,
          id: node.id
        });
        console.log("Added circular instance to list:", node.name, "Total:", circularInstances.length);
        skippedCount++;
        return;
      }
      try {
        const componentProperties = node.componentProperties;
        if (componentProperties && "Theme" in componentProperties) {
          const themeProperty = componentProperties["Theme"];
          if (themeProperty && themeProperty.type === "VARIANT") {
            if (themeProperty.value === theme) {
              console.log("Instance already has the desired theme:", node.name);
              skippedCount++;
              return;
            }
            try {
              console.log("Updating theme for node:", node.name);
              node.setProperties({ Theme: theme });
              updatedCount++;
            } catch (error) {
              console.error("Error updating theme for node:", node.name, error);
              skippedCount++;
            }
          }
        }
      } catch (error) {
        console.error("Error processing instance for theme update:", error);
      }
    }
    if ("children" in node) {
      for (const child of node.children) {
        traverseNode(child);
      }
    }
  }
  figma.currentPage.selection.forEach((node) => traverseNode(node));
  console.log("Final circular instances count:", circularInstances.length);
  console.log("Circular instances:", circularInstances);
  return { updatedCount, skippedCount, circularInstances };
}
var init_main = __esm({
  "src/main.ts"() {
    "use strict";
    init_lib();
  }
});

// <stdin>
var modules = { "src/main.ts--default": (init_main(), __toCommonJS(main_exports))["default"] };
var commandId = true ? "src/main.ts--default" : figma.command;
modules[commandId]();
