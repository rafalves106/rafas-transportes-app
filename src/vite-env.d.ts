/// <reference types="vite-plugin-svgr/client" />

declare module "*.webp" {
  const src: string;
  export default src;
}
