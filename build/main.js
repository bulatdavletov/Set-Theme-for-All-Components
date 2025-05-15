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
async function main_default() {
  console.log("Plugin started");
  if (figma.command) {
    console.log("Plugin launched with command:", figma.command);
    if (figma.command === "apply-dark-theme") {
      const result = await applyThemeToSelectionCommand("Dark");
      if (result.updatedCount > 0) {
        figma.notify(`\u2705 Updated ${result.updatedCount} / ${result.skippedCount + result.updatedCount}`);
      } else if (result.skippedCount > 0) {
        figma.notify(`\u{1F31A} Everything already Dark`);
      }
      figma.closePlugin();
      return;
    } else if (figma.command === "apply-light-theme") {
      const result = await applyThemeToSelectionCommand("Light");
      if (result.updatedCount > 0) {
        figma.notify(`\u2705 Updated ${result.updatedCount}/${result.skippedCount + result.updatedCount}`);
      } else if (result.skippedCount > 0) {
        figma.notify(`\u2600\uFE0F Everything already Light`);
      }
      figma.closePlugin();
      return;
    }
  }
  const options = { width: 240, height: 320 };
  showUI(options);
  async function updateThemesFromSelection() {
    console.log("Updating themes from selection");
    if (figma.currentPage.selection.length === 0) {
      console.log("No selection");
      figma.ui.postMessage({
        type: "NO_SELECTION"
      });
      return;
    }
    const result = await findAvailableThemes();
    const themes = ["Light", "Dark"];
    figma.ui.postMessage({
      type: "THEMES_AVAILABLE",
      themes,
      instanceCount: result.instanceCount,
      circularInstances: result.circularInstances,
      checkedLayersCount: result.checkedLayersCount
    });
  }
  figma.ui.onmessage = async (msg) => {
    if (msg.type === "SUBMIT") {
      console.log("Applying theme:", msg.theme);
      const result = await applyThemeToSelection(msg.theme);
      figma.ui.postMessage({
        type: "RESULTS",
        theme: msg.theme,
        updatedCount: result.updatedCount,
        skippedCount: result.skippedCount,
        circularInstances: result.circularInstances,
        checkedLayersCount: result.checkedLayersCount
      });
    } else if (msg.type === "INIT" || msg.type === "SELECTION_CHANGED") {
      await updateThemesFromSelection();
    } else if (msg.type === "CANCEL") {
      figma.closePlugin();
    }
  };
  figma.on("run", async ({ command }) => {
    if (command === "apply-dark-theme") {
      console.log("Running command: Set Dark Theme to All");
      const result = await applyThemeToSelectionCommand("Dark");
      if (result.updatedCount > 0) {
        figma.notify(`\u2705 Updated ${result.updatedCount}/${result.updatedCount + result.skippedCount}`, { timeout: 3e3 });
      } else if (result.skippedCount > 0) {
        figma.notify(`\u{1F31A} Everything already Dark`, { timeout: 3e3 });
      }
      figma.closePlugin();
    } else if (command === "apply-light-theme") {
      console.log("Running command: Set Light Theme to All");
      const result = await applyThemeToSelectionCommand("Light");
      if (result.updatedCount > 0) {
        figma.notify(`\u2705 Updated ${result.updatedCount}/${result.updatedCount + result.skippedCount}`, { timeout: 3e3 });
      } else if (result.skippedCount > 0) {
        figma.notify(`\u2600\uFE0F Everything already Light`, { timeout: 3e3 });
      }
      figma.closePlugin();
    }
  });
  (async () => {
    await updateThemesFromSelection();
  })();
  figma.on("selectionchange", async () => {
    await updateThemesFromSelection();
  });
}
async function hasCircularReference(instance) {
  var _a;
  try {
    const mainComponent = await instance.getMainComponentAsync();
    if (!mainComponent) return false;
    const mainComponentId = mainComponent.id;
    const mainComponentSetId = (_a = mainComponent.parent) == null ? void 0 : _a.id;
    let parent = instance.parent;
    while (parent) {
      if (parent.type === "COMPONENT" && parent.id === mainComponentId) {
        console.log("Circular reference detected:", instance.name, "is inside its own main component");
        return true;
      }
      if (parent.type === "COMPONENT_SET" && parent.id === mainComponentSetId) {
        console.log("Ignoring instance from same component set:", instance.name);
        return false;
      }
      if (parent.type === "INSTANCE") {
        const parentMainComponent = await parent.getMainComponentAsync();
        if (parentMainComponent && parentMainComponent.parent && parentMainComponent.parent.id === mainComponentSetId) {
          console.log("Potential cycle detected: Instance nested inside another instance from the same component set:", instance.name);
          return true;
        }
      }
      parent = parent.parent;
    }
    return false;
  } catch (error) {
    console.log("Error checking for circular reference:", error);
    return false;
  }
}
async function findAvailableThemes() {
  let instanceCount = 0;
  let themePropertyCount = 0;
  let checkedLayersCount = 0;
  const circularInstances = [];
  async function traverseNode(node) {
    checkedLayersCount++;
    console.log("Checking layer:", node.name, "Type:", node.type);
    if (node.type === "INSTANCE") {
      instanceCount++;
      console.log("Instance found:", node.name);
      try {
        const mainComponent = await node.getMainComponentAsync();
        if (mainComponent) {
          console.log("Main component:", mainComponent.name);
          const isCircular = await hasCircularReference(node);
          if (isCircular) {
            console.error("Skipping theme detection for circular instance:", node.name);
            circularInstances.push({
              name: node.name,
              id: node.id
            });
            return;
          }
        }
      } catch (error) {
        console.log("Error getting main component:", error);
      }
      try {
        const componentProperties = node.componentProperties;
        if (componentProperties && "Theme" in componentProperties) {
          const themeProperty = componentProperties["Theme"];
          if (themeProperty && themeProperty.type === "VARIANT") {
            if (themeProperty.value && typeof themeProperty.value === "string") {
            }
            try {
              const mainComponent = await node.getMainComponentAsync();
              if (mainComponent) {
                if (mainComponent.variantProperties) {
                  if ("Theme" in mainComponent.variantProperties) {
                    const themeValues = mainComponent.variantProperties["Theme"];
                    if (Array.isArray(themeValues)) {
                      themeValues.forEach((value) => {
                      });
                    }
                  }
                }
              }
            } catch (error) {
              console.log("Error getting theme values:", error);
            }
          }
        }
      } catch (error) {
        console.log("Error checking component properties:", error);
      }
    }
    if ("children" in node) {
      for (const child of node.children) {
        await traverseNode(child);
      }
    }
  }
  for (const node of figma.currentPage.selection) {
    await traverseNode(node);
  }
  console.log(`Found ${instanceCount} instances, ${themePropertyCount} with Theme property, checked ${checkedLayersCount} layers total`);
  return {
    instanceCount: themePropertyCount,
    circularInstances,
    checkedLayersCount
  };
}
async function applyThemeToSelection(theme) {
  let updatedCount = 0;
  let skippedCount = 0;
  let checkedLayersCount = 0;
  let instanceCount = 0;
  let progressUpdateCounter = 0;
  const circularInstances = [];
  let totalNodesToProcess = 0;
  figma.currentPage.selection.forEach((node) => {
    countNodes(node);
  });
  function countNodes(node) {
    totalNodesToProcess++;
    if ("children" in node) {
      for (const child of node.children) {
        countNodes(child);
      }
    }
  }
  console.log("Estimated total nodes to process:", totalNodesToProcess);
  figma.ui.postMessage({
    type: "PROGRESS_UPDATE",
    checked: 0,
    total: totalNodesToProcess,
    updated: 0,
    skipped: 0,
    instances: 0
  });
  async function traverseNode(node) {
    checkedLayersCount++;
    console.log("Checking layer:", node.name, "Type:", node.type);
    if (node.type === "INSTANCE") {
      instanceCount++;
      console.log("Instance found:", node.name);
      try {
        const mainComponent = await node.getMainComponentAsync();
        if (mainComponent) {
          console.log("Main component:", mainComponent.name);
          const isCircular = await hasCircularReference(node);
          if (isCircular) {
            console.error("Skipping theme detection for circular instance:", node.name);
            circularInstances.push({
              name: node.name,
              id: node.id
            });
            return;
          }
        }
      } catch (error) {
        console.log("Error getting main component:", error);
      }
      try {
        const componentProperties = node.componentProperties;
        if (componentProperties && "Theme" in componentProperties) {
          const themeProperty = componentProperties["Theme"];
          if (themeProperty && themeProperty.type === "VARIANT") {
            if (themeProperty.value && typeof themeProperty.value === "string") {
            }
            try {
              const mainComponent = await node.getMainComponentAsync();
              if (mainComponent) {
                if (mainComponent.variantProperties) {
                  if ("Theme" in mainComponent.variantProperties) {
                    const themeValues = mainComponent.variantProperties["Theme"];
                    if (Array.isArray(themeValues)) {
                      themeValues.forEach((value) => {
                      });
                    }
                  }
                }
              }
            } catch (error) {
              console.log("Error getting theme values:", error);
            }
          }
        }
      } catch (error) {
        console.log("Error checking component properties:", error);
      }
    }
    if ("children" in node) {
      for (const child of node.children) {
        await traverseNode(child);
      }
    }
  }
  for (const node of figma.currentPage.selection) {
    await traverseNode(node);
  }
  figma.ui.postMessage({
    type: "PROGRESS_UPDATE",
    checked: checkedLayersCount,
    total: totalNodesToProcess,
    updated: updatedCount,
    skipped: skippedCount,
    instances: instanceCount,
    isComplete: true
  });
  console.log("Final circular instances count:", circularInstances.length);
  console.log("Circular instances:", circularInstances);
  console.log("Checked layers count:", checkedLayersCount);
  console.log("Total instances count:", instanceCount);
  return { updatedCount, skippedCount, circularInstances, checkedLayersCount };
}
async function applyThemeToSelectionCommand(theme) {
  let updatedCount = 0;
  let skippedCount = 0;
  let checkedLayersCount = 0;
  let instanceCount = 0;
  const circularInstances = [];
  let totalNodesToProcess = 0;
  figma.currentPage.selection.forEach((node) => {
    countNodesCommand(node);
  });
  function countNodesCommand(node) {
    totalNodesToProcess++;
    if ("children" in node) {
      for (const child of node.children) {
        countNodesCommand(child);
      }
    }
  }
  console.log("Estimated total nodes to process:", totalNodesToProcess);
  async function traverseNodeCommand(node) {
    checkedLayersCount++;
    console.log("Checking layer:", node.name, "Type:", node.type);
    if (node.type === "INSTANCE") {
      instanceCount++;
      console.log("Checking instance for update:", node.name);
      if (await hasCircularReference(node)) {
        console.error("Skipping update for circular instance:", node.name);
        circularInstances.push({
          name: node.name,
          id: node.id
        });
        console.log("Added circular instance to list:", node.name, "Total:", circularInstances.length);
        skippedCount++;
      } else {
        try {
          const componentProperties = node.componentProperties;
          if (componentProperties && "Theme" in componentProperties) {
            const themeProperty = componentProperties["Theme"];
            if (themeProperty && themeProperty.type === "VARIANT") {
              if (themeProperty.value === theme) {
                console.log("Instance already has the desired theme:", node.name);
                skippedCount++;
              } else {
                try {
                  console.log("Updating theme for node:", node.name);
                  try {
                    node.setProperties({ Theme: theme });
                    updatedCount++;
                  } catch (error) {
                    if (error.message && error.message.includes("cycle")) {
                      console.log("Cycle error detected when updating theme for:", node.name, "- Skipping this instance");
                      circularInstances.push({
                        name: node.name,
                        id: node.id
                      });
                    } else {
                      console.error("Error updating theme for node:", node.name, error);
                    }
                    skippedCount++;
                  }
                } catch (error) {
                  console.error("Error updating theme for node:", node.name, error);
                  skippedCount++;
                }
              }
            }
          }
        } catch (error) {
          console.error("Error processing instance for theme update:", error);
        }
      }
    }
    if ("children" in node) {
      for (const child of node.children) {
        await traverseNodeCommand(child);
      }
    }
  }
  for (const node of figma.currentPage.selection) {
    await traverseNodeCommand(node);
  }
  console.log("Final circular instances count:", circularInstances.length);
  console.log("Circular instances:", circularInstances);
  console.log("Checked layers count:", checkedLayersCount);
  console.log("Total instances count:", instanceCount);
  return { updatedCount, skippedCount, circularInstances, checkedLayersCount };
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
