/**
 * This file is part of YourDLT Wallet Plugins shared under LGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     YourDLT Wallet Plugins
 * @subpackage  @yourdlt/plugin-ninjazzz
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     LGPL-3.0
 */
import Vue, { VueConstructor } from "vue";

// internal dependencies
// child components
import Dojo from "./views/Dojo/Dojo.vue";
import Ninja from "./views/Ninja/Ninja.vue";

/// region components library
const components: { [s: string]: VueConstructor } = {
  Dojo,
};

export const registerComponents = (): { [s: string]: VueConstructor } => {
  Object.keys(components).forEach((k) => Vue.component(k, components[k]));
  return components;
};
/// end-region components library

/// region installable plugin
/**
 * @export default
 * @description This plugin is a game that consists in the end-user
 * clicking an appearance of Ninja(s) at the right time. The player
 * is rewarded with custom mosaics and ownership of said Ninja.
 * @version 0.4.0
 * @license LGPL-3.0
 */
export default {
  friendlyName: "NinjaZZZ (Game)",

  view: "Dojo",

  routes: [
    {
      path: "/ninjazzz",
      name: "ninjazzz.dojo",
      meta: {
        protected: true,
        title: "NinjaZZZ Dojo",
        hideFromMenu: true,
      },
      props: false,
      // no-component
    },
  ],

  components,

  storages: [
    {
      storageKey: "ninjazzz.catches",
      primaryKey: 'id',
      description: "Stores NinjaZZZ that have been caught.",
    },
  ],

  settings: [],

  permissions: [
    {
      name: "ninjazzz.readCatches",
      type: "action",
      target: "db/SELECT",
      description:
        "This permission is requested to read caught ninjas for the active account.",
    },
    {
      name: "ninjazzz.createCatches",
      type: "action",
      target: "db/INSERT",
      description:
        "This permission is requested to store caught ninjas for the active account.",
    },
    {
      name: "ninjazzz.updateCatches",
      type: "action",
      target: "db/UPDATE",
      description:
        "This permission is requested to update information about caught ninjas for the active account.",
    },
    {
      name: "ninjazzz.deleteCatches",
      type: "action",
      target: "db/DELETE",
      description:
        "This permission is requested to delete existing caught ninjas for the active account.",
    },
    {
      name: "ninjazzz.getRepositoryFactory",
      type: "getter",
      target: "network/repositoryFactory",
      description:
        "This permission is requested to fetch the currently active node information.",
    },
    {
      name: "ninjazzz.getCurrentSignerAddress",
      type: "getter",
      target: "account/currentSignerAddress",
      description:
        "This permission is requested to fetch the currently active signer address.",
    }
  ]
};
/// end-region installable plugin
