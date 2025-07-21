export interface StratusConfig {
  // Paths
  routesDir: string;
  layoutsDir: string;
  publicDir: string;
  
  // Routing
  basePath: string;
  trailingSlash: boolean;
  
  // Pages
  pageExtensions: string[];
  defaultLayout?: string;
  
  // Error pages
  notFoundPage?: string;
  errorPage?: string;
}

export const defaultConfig: StratusConfig = {
  routesDir: 'src/app',
  layoutsDir: 'src/layouts',
  publicDir: 'public',
  basePath: '',
  trailingSlash: false,
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  notFoundPage: '404',
  errorPage: '_error'
};

let config: StratusConfig = { ...defaultConfig };

export const getConfig = (): StratusConfig => config;

export const setConfig = (userConfig: Partial<StratusConfig>): void => {
  config = { ...defaultConfig, ...userConfig };
};