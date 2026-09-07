import rows from './data.json';

type Tool = {
  name: string;
  description: string;
  inputSchema: object;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute: (input: unknown) => unknown;
};
type ModelContext = { registerTool: (tool: Tool, options: {signal: AbortSignal}) => void | Promise<void> };

export const salesTool: Tool = {
  name: 'read_approximate_alcohol_sales',
  description: 'Read approximate Swedish recorded alcohol sales for selected years from the same PNG traces shown in the interactive chart. These are not original CAN observations.',
  inputSchema: {type:'object',properties:{years:{type:'array',items:{type:'integer',minimum:1861,maximum:2006},minItems:1,maxItems:146}},required:['years'],additionalProperties:false},
  annotations: {readOnlyHint:true,untrustedContentHint:false},
  execute(input: unknown) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Provide an object containing years.');
    const value = input as Record<string, unknown>;
    if(Object.keys(value).some(key=>key!=='years') || !Array.isArray(value.years) || value.years.length<1 || value.years.length>146 || !value.years.every(year=>Number.isInteger(year)&&year>=1861&&year<=2006)) throw new Error('Provide 1–146 integer years from 1861 through 2006.');
    return {unit:'Litres of pure alcohol per inhabitant aged 15+',precision:'Approximate raster traces; not original annual observations',sales:value.years.map(year=>rows[year-1861])};
  },
};

export function registerSalesTool() {
  const context=(document as Document & {modelContext?: ModelContext}).modelContext;
  if(!context?.registerTool) return;
  const lifecycle=new AbortController();
  try { void Promise.resolve(context.registerTool(salesTool,{signal:lifecycle.signal})).catch(()=>{}); } catch { /* The chart remains usable without WebMCP. */ }
  return ()=>lifecycle.abort();
}
