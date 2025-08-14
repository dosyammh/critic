/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/` | `/(tabs)/profile` | `/(tabs)/search` | `/(tabs)/social` | `/(tabs)/trending` | `/_sitemap` | `/profile` | `/search` | `/social` | `/trending`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
