// ./src/env.d.ts
/// <reference types="astro/client" />
/// <reference types="@sanity/astro/module" />

declare namespace App {
  interface Locals {
    // Gezet door src/middleware.ts
    visualEditing: boolean;
  }
}
