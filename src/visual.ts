// visual.ts
"use strict";
import powerbi from "powerbi-visuals-api";
import "./../style/visual.less";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import DataView = powerbi.DataView;
import * as React from "react";
import { createRoot, Root } from "react-dom/client"; // Updated import
import OrgChart from "./OrgChart";
import { Employee } from "./types"; // Correct import

export class Visual implements IVisual {
  private target: HTMLElement;
  private root: Root; // Root from react-dom/client

  constructor(options: VisualConstructorOptions) {
    console.log("Visual constructor", options);
    this.target = options.element;
    // Create a root.
    this.root = createRoot(this.target);
  }

  public update(options: VisualUpdateOptions) {
    const dataView: DataView = options.dataViews && options.dataViews[0];
    if (!dataView || !dataView.table || !dataView.table.rows) {
      console.error("DataView is not valid");
      return;
    }

    const table = dataView.table;
    const columns = table.columns;

    // Find indices based on roles
    const indexIndex = columns.findIndex(col => col.roles["index"]);
    const nameIndex = columns.findIndex(col => col.roles["name"]);
    const designationIndex = columns.findIndex(col => col.roles["designation"]);
    const imageIndex = columns.findIndex(col => col.roles["imageBase64"]);
    const managerIndex = columns.findIndex(col => col.roles["managerIndex"]);

    if (nameIndex === -1 || designationIndex === -1 || imageIndex === -1) {
      console.error("Required columns (name, designation, imageBase64) are missing.");
      return;
    }

    // Create a mapping from index to name for manager lookup
    const indexToNameMap: { [key: number]: string } = {};
    table.rows.forEach(row => {
      const indexValue = indexIndex !== -1 ? (row[indexIndex] as number) : undefined;
      const nameValue = row[nameIndex] as string;
      if (indexValue !== undefined) {
        indexToNameMap[indexValue] = nameValue;
      }
    });

    const data: Employee[] = table.rows.map(row => {
      const indexValue = indexIndex !== -1 ? (row[indexIndex] as number) : undefined;
      const nameValue = row[nameIndex] as string;
      const designationValue = row[designationIndex] as string;
      const imageValue = row[imageIndex] as string;
      const managerIndexValue = managerIndex !== -1 ? (row[managerIndex] as number) : undefined;
      const managerName = managerIndexValue !== undefined ? indexToNameMap[managerIndexValue] : undefined;

      return {
        index: indexValue,
        name: nameValue,
        designation: designationValue,
        imageBase64: imageValue,
        manager: managerName,
      };
    });

    // Log the data for debugging
    console.log("Employee Data:", data);

    // Render the OrgChart component using the new root.render method
    this.root.render(React.createElement(OrgChart, { data: data }));
  }

  public destroy(): void {
    // Cleanup the React component when the visual is destroyed using root.unmount
    this.root.unmount();
  }
}