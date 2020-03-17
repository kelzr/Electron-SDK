/** @zh-cn
 * @ignore
 */
/** 
 * @ignore
 */
export interface PluginInfo {
  id: string;
  path: string;
}

/** @zh-cn
 * @ignore 
 */
/** 
 * @ignore
 */
export interface Plugin {
  id: string;
  enable: () => number;
  disable: () => number;
  setParameter: (param: string) => number;
  getParameter: (paramKey: string) => string;
}