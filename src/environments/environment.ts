// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  baseURL: '/',
  origin: 'http://localhost/Austracker/',
  socketURL: 'http://202.131.115.45:4505',
  token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3tET01BSU59LyIsImF1ZCI6IkNMSUVOVF9JRCIsInN1YiI6ImFub255bW91cyIsImlhdCI6IjE0OTkzNDUyODQiLCJleHAiOiIxNDk5OTUwMDg0IiwibmFtZSI6InN0ZXZlIn0.xXrFfPT6SEz2oDRPp9tenyCp3C15aHSM750_NjJUBIA",
  adminTokenKey: 'AusToken',
  userTokenKey: 'ClientToken',
  googleMapUrl: "https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places",
  mapApiKey: "AIzaSyDxX3Ok-zn07ZAQiqrgjO0AJAhGHQNrNF4",
  googleLocationUrl: "http://maps.googleapis.com/maps/api/geocode/json?latlng=##LATLNG##&sensor=true"
};
