// Allows TypeScript to import .png files (for Leaflet icons)
declare module "*.png" {
  const value: string;
  export default value;
}
